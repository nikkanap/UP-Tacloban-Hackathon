import ElectionContract from './contract.js';
import { generateTokenCategory } from './token.js';
import { sendBCHToAddress, sendTokenToAddress } from './transaction.js';
import { getWalletFromWIF, getTemplateFromWIFCS } from './wallet.js' // import Wallet if mainnet
import { NFTCapability } from "mainnet-js";
import { sleep } from './utils.js';
import dotenv from "dotenv";

dotenv.config();

const WALLET_WIF = process.env.PRIVATE_KEY_WIF; // chipnet private key WIF from an existing wallet
const NETWORK = process.env.NETWORK || 'chipnet'; 

// election NFT with minting capability
export async function generateElectionNFT(electionId) {
  const wallet = await getWalletFromWIF(WALLET_WIF, NETWORK);
  const walletAddress = await wallet.getDepositAddress();

  const commitment = Buffer.alloc(8);
  commitment.writeBigUInt64LE(BigInt(electionId), 0);

  const NFT = { 
    commitment: commitment.toString("hex"),
    capability: NFTCapability.minting 
  }
  
  const walletSendTxid = await sendBCHToAddress(wallet, walletAddress, 2000);
  await sleep(5000);

  const category = await generateTokenCategory(wallet, null, NFT);
  console.log(category);
  return category;
}

// generate candidate NFT from election NFT
export async function generateCandidateNFT(electionNFTCategory, candidateId, positionId) {
  const wallet = await getWalletFromWIF(WALLET_WIF, NETWORK);
  const walletAddress = await wallet.getTokenDepositAddress();
  
  const commitment = Buffer.alloc(24);
  commitment.writeBigUInt64LE(BigInt(candidateId), 0); // candidate
  commitment.writeBigUInt64LE(BigInt(positionId), 8);  // position
  commitment.writeBigUInt64LE(BigInt(0), 16);         // count

  const result = await wallet.tokenMint({
    cashaddr: walletAddress,
    category: electionNFTCategory,
    nft: {
      capability: NFTCapability.mutable,
      commitment: commitment.toString("hex"),
    }
  });
  console.log(result);
  return result;
}

// generate voter NFT 
export async function generateVoterNFT(electionNFTCategory, voterId, positionId) {
  const wallet = await getWalletFromWIF(WALLET_WIF, NETWORK);
  const walletAddress = await wallet.getTokenDepositAddress();

  const commitment = Buffer.alloc(16);
  commitment.writeBigUInt64LE(BigInt(voterId), 0);
  commitment.writeBigUInt64LE(BigInt(positionId), 8);

  const result = await wallet.tokenMint({
      cashaddr: walletAddress,
      category: electionNFTCategory,
      nft: {
          capability: NFTCapability.none,
          commitment: commitment.toString("hex")
      }
  });
  console.log(result);
  return result;
}

// allows us to send the NFTs to the contract (init)
export async function sendNFToContract(electionCategory, candidateId, openTime, closeTime, positionId) {
  const wallet = await getWalletFromWIF(WALLET_WIF, NETWORK);
  const tokenAddress = await wallet.getTokenDepositAddress(0);
  const walletAddress = await wallet.getDepositAddress();
  const publicKey = await wallet.getPublicKeyCompressed(); // get compressed version
  
  // find the NFT of the candidate
  const utxos = await wallet.getUtxos();
  const NFT = utxos.find(
    utxo => utxo.token?.category === electionCategory &&
    utxo.token?.nft?.capability === NFTCapability.mutable &&
    utxo.token?.nft?.commitment?.length === 48 &&
    decodeCommitment(utxo.token.nft.commitment, 0).toString() === String(candidateId) &&
    (positionId == null || decodeCommitment(utxo.token.nft.commitment, 8).toString() === String(positionId))
  );

  if (!NFT?.token) {
    throw new Error(`Candidate NFT not found for candidate ${candidateId}`);
  }

  const token = NFT.token;

  // creating a new contract instance
  const contract = new ElectionContract(publicKey, NETWORK, electionCategory, BigInt(openTime), BigInt(closeTime));
  const contractAddress = contract.getContractTokenAddress();

  const tokenTxId = await sendTokenToAddress(wallet, contractAddress, token, NFT.satoshis, NFT);
  return tokenTxId;
}

function decodeCommitment(commitmentHex, position) {
  return Buffer
    .from(commitmentHex, "hex")
    .readBigUInt64LE(position);
}

export async function castVote(electionCategory, candidateId, voterId, openTime, closeTime) {
  const wallet = await getWalletFromWIF(WALLET_WIF, NETWORK);
  const tokenAddress = await wallet.getTokenDepositAddress(0);
  const template = getTemplateFromWIFCS(WALLET_WIF); 
  const publicKey = await wallet.getPublicKeyCompressed(); // get compressed version

  // creating a new contract instance
  const contract = new ElectionContract(publicKey, NETWORK, electionCategory, BigInt(openTime), BigInt(closeTime));
  const contractTxId = await contract.castVote(tokenAddress, template, electionCategory, candidateId, voterId);
  return contractTxId;
}
