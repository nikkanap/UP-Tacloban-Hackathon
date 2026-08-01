import ElectionContract from './contract.js';
import { generateTokenCategory } from './token.js';
import { sendBCHToAddress, sendTokenToAddress } from './transaction.js';
import { getWalletFromWIF, getTemplateFromWIFCS } from './wallet.js' // import Wallet if mainnet
import { NFTCapability, TokenMintRequest } from "mainnet-js";
import { sleep } from './utils.js';
import dotenv from "dotenv";

dotenv.config();

const WALLET_WIF = process.env.PRIVATE_KEY_WIF; // chipnet private key WIF from an existing wallet
const NETWORK = 'chipnet'; 

// election NFT with minting capability
export async function generateElectionNFT(electionId) {
  const wallet = await getWalletFromWIF(WALLET_WIF, NETWORK);

  const commitment = Buffer.alloc(8);
  commitment.writeBigUInt64LE(electionId);

  const NFT = { 
    commitment: commitment.toString("hex"),
    capability: NFTCapability.minting 
  }

  const category = await generateTokenCategory(wallet, null, NFT);
  console.log(category);
  return category;
}

// generate candidate NFT from election NFT
export async function generateCandidateNFT(electionNFTCategory, candidateId, position) {
  const wallet = await getWalletFromWIF(WALLET_WIF, NETWORK);
  const walletAddress = await wallet.getTokenDepositAddress();
  
  const commitment = Buffer.alloc(24);
  commitment.writeBigUInt64LE(candidateId); // candidate
  commitment.writeBigUInt64LE(position);  // position
  commitment.writeBigUInt64LE(0);         // count

  const result = await wallet.tokenMint({
    cashaddr: walletAddress,
    requests: [
      {
        category: electionNFTCategory,
        capability: NFTCapability.mutable,
        commitment: commitment.toString("hex"),
      }
    ]
  });
  console.log(result);
  return result;
}

// generate voter NFT 
export async function generateVoterNFT(electionNFTCategory, voterId, position) {
  const wallet = await getWalletFromWIF(WALLET_WIF, NETWORK);
  const walletAddress = await wallet.getTokenDepositAddress();

  const commitment = Buffer.alloc(16);
  commitment.writeBigUInt64LE(voterId);   // candidate
  commitment.writeBigUInt64LE(position);  // position

  const result = await wallet.tokenMint({
    cashaddr: walletAddress,
    requests: [
      {
        category: electionNFTCategory,
        capability: NFTCapability.none,
        commitment: commitment.toString("hex"),
      }
    ]
  });
  console.log(result);
  return result;
}

// allows us to send the NFTs to the contract (init)
export async function sendNFToContract(electionCategory, openTime, closeTime) {
  const wallet = await getWalletFromWIF(WALLET_WIF, NETWORK);
  const tokenAddress = await wallet.getTokenDepositAddress(0);
  const walletAddress = await wallet.getDepositAddress();
  const publicKey = await wallet.getPublicKeyCompressed(); // get compressed version

  const utxos = await wallet.getUtxos();
  const tokenUtxo = utxos.find(utxo => utxo.token?.nft?.capability === 'mutable');
  const token = tokenUtxo.token;

  // creating a new contract instance
  const contract = new ElectionContract(publicKey, NETWORK, electionCategory, openTime, closeTime);
  const contractUtxos = await contract.getContractUtxos();
  const contractAddress = contract.getContractTokenAddress();

  // initially sending the mutable token
  const tokenTxId = await sendTokenToAddress(wallet, contractAddress, token);
  return tokenTxId;
}

export async function castVote() {
  const wallet = await getWalletFromWIF(WALLET_WIF, NETWORK);
  const tokenAddress = await wallet.getTokenDepositAddress(0);
  const template = getTemplateFromWIFCS(WALLET_WIF); 

  const publicKeys = {
    // insert keys here
  };

  // creating a new contract instance
  const contract = new Contract(publicKeys, NETWORK);

  const walletBchUtxo = utxos.find(utxo => !utxo.token);
  const contractTxId = await contract.castVote(tokenAddress, template, BigInt(1000));
  return contractTxId;
}