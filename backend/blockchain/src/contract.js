import { Contract, ElectrumNetworkProvider, TransactionBuilder, utils } from "cashscript"
import contractArtifact from '../cashscript/Vote.json' with { type: "json" };
import { ripemd160, sha256 } from "@cashscript/utils";

class ElectionContract {
  constructor (publicKey, network, electionCategory, openTime, closeTime) {
    this.publicKey = publicKey
    this.network = network;
    this.electionCategory = electionCategory;
    this.openTime = openTime;
    this.closeTime = closeTime;
    this.provider = new ElectrumNetworkProvider(this.network)

    const ownerPkh = this.getPubKeyHash(this.publicKey);

    const contractParams = [
      ownerPkh,
      this.electionCategory,
      this.openTime,
      this.closeTime
    ]

    this.contract = new Contract(contractArtifact, contractParams, { provider: this.provider })
  }


  // Get the address of the contract
  getContractTokenAddress() {
    return this.contract.tokenAddress;
  }

  async getContractUtxos() {
    return await this.contract.getUtxos()
  }

  // Generates a hash of the given public key using the hash160 algorithm.
  getPubKeyHash (pubKey) {
    return ripemd160(sha256(Buffer.from(pubKey, 'hex')))
  }

  async castVote(walletAddress, walletTemplate, electionCategory, candidateId, voterId) {
    // get contract utxos
    const contractUtxos = await this.getContractUtxos();

    // find the specific candidate nft on their candidate Id
    const candidateNFT = contractUtxos.find(
      utxo => utxo.token?.category == electionCategory &&
      decodeCommitment(utxo.token?.nft?.commitment, 0) == candidateId
    );
    if (!candidateNFT) {
      console.error("Candidate NFT not found inside contract.");
      return;
    }

    // get the candidate commitment information
    const candidateCommitment = Buffer.from(
      candidateNFT.token?.nft?.commitment,
      "hex"
    );
    const positionId = candidateCommitment.readBigUInt64LE(8);
    const voteCount  = candidateCommitment.readBigUInt64LE(16);

    // find the voter NFT for that position
    const walletUtxos = await this.provider.getUtxos(walletAddress);
    walletUtxos.forEach(u => {
      console.log(
        u.token?.category,
        u.token?.nft?.commitment,
        Buffer.from(u.token?.nft?.commitment ?? "", "hex").length
      );
    });
    
    const voterNFT = walletUtxos.find(
      utxo?.token?.category == electionCategory && utxo?.token &&
      (utxo?.token?.nft?.commitment).length == 32 &&
      decodeCommitment(utxo?.token?.nft?.commitment, 0) == voterId && 
      decodeCommitment(utxo?.token?.nft?.commitment, 8) == positionId  
  )
    if (!voterNFT) {
      console.error("No voterNFT inside wallet.");
      return; // voter already voted for that position
    }
    
    // read the candidate commitment for the count and update it
    const updatedCount = voteCount + 1;
    const newCommitment = Buffer.alloc(24);
    newCommitment.writeBigUInt64LE(BigInt(candidateId), 0);   // candidate
    newCommitment.writeBigUInt64LE(BigInt(positionId), 8);  // position
    newCommitment.writeBigUInt64LE(BigInt(updatedCount), 16);  // position

    const tb = new TransactionBuilder({provider: this.provider});
    tb.addInput(candidateNFT, this.contract.unlock.castVote());
    tb.addInput(voterNFT, walletTemplate.unlockP2PKH());
    tb.addOutput(
      {  
        to: this.getContractTokenAddress(),
        amount: candidateNFT.satoshis,
        token: {
          category: candidateNFT.token?.category,
          amount: candidateNFT.token?.amount,
          nft: {
            commitment: newCommitment.toString("hex"),
            capability: candidateNFT.token?.nft.capability,
          }
        }
      } 
    )
    
    const txId = await tb.send();
    return txId;
  }
}

function decodeCommitment(commitmentHex, position) {
  return Buffer
    .from(commitmentHex, "hex")
    .readBigUInt64LE(position);
}

export default ElectionContract;