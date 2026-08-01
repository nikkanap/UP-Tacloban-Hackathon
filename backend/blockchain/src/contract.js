import { Contract, ElectrumNetworkProvider, TransactionBuilder, utils } from "cashscript"
import contractArtifact from '../../blockchain/cashscript/Vote.json' with { type: "json" };
import { ripemd160, sha256 } from "@cashscript/utils";

class ElectionContract {
  constructor (publicKey, network, electionCategory, openTime, closeTime) {
    this.publicKey = publicKey
    this.network = network;
    this.electionCategory = electionCategory;
    this.openTime = openTime;
    this.closeTime = closeTime;

    this.initialize()
  }

  initialize() {
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

  async castVote(walletAddress, electionCategory, candidateId, voterId) {
    // get contract utxos
    const contractUtxos = await this.getContractUtxos();

    // find the specific candidate nft on their candidate Id
    const candidateNFT = contractUtxos.find(
      utxo => utxo.token?.category == electionCategory &&
      decodeCommitment(utxo.token?.nft?.commitment, 0) == candidateId
    );
    if (!candidateNFT) {
      console.error("Candidate's NFT found inside the contract.");
      return;
    }

    // get the candidate commitment information
    const candidateCommitment = Buffer.from(
      candidateNFT.token?.nft?.commitment,
      "hex"
    );
    const positionId = candidateCommitment.readBigUInt64BE(16);
    const voteCount  = candidateCommitment.readBigUInt64BE(24);

    // find the voter NFT for that position
    const walletUtxos = await this.provider.getUtxos(walletAddress);
    const voterNFT = walletUtxos.find(
      utxo => utxo.token?.category == electionCategory && 
      decodeCommitment(utxo.token?.nft?.commitment, 8) == voterId && 
      decodeCommitment(utxo.token?.nft?.commitment, 16) == positionId  
    )
    if (!voterNFT) {
      console.error("No voterNFT inside wallet.");
      return; // voter already voted for that position
    }
    
    // read the candidate commitment for the count and update it
    const updatedCount = count + BigInt(1);
    const newCommitment = Buffer.alloc(32);
    newCommitment.writeBigUInt64LE(candidateIdComm);   // candidate
    newCommitment.writeBigUInt64LE(candidateIdComm);   // candidate
    newCommitment.writeBigUInt64LE(positionId);  // position
    newCommitment.writeBigUInt64LE(updatedCount);  // position

    const tb = new TransactionBuilder({provider: this.provider});
    tb.addInput(candidateNFT, this.contract.unlock.payloan(payAmount));
    tb.addInput(voterNFT, borrowerTemplate.unlockP2PKH());
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