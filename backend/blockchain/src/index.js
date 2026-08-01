import express from "express";
import {
  generateElectionNFT,
  generateCandidateNFT,
  generateVoterNFT,
  sendNFToContract,
  castVote
} from "./election.js";

const app = express();

app.use(express.json());

app.post("/nft/generate-election-nft", async (req, res) => {
  try {
    const { election_id } = req.body;

    const result = await generateElectionNFT(election_id);
    console.log("/nft/generate-election-nft", result);
    res.json({
      success: true,
      result
    });

  } catch(error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/nft/generate-candidate-nft", async (req, res) => {
  try {
    const { 
      nft_category,
      candidate_id,
      position_id
    } = req.body;

    const result = await generateCandidateNFT(nft_category, candidate_id, position_id);
    console.log("/nft/generate-candidate-nft", result);

    res.json({
      success: true,
      result
    });

  } catch(error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/nft/generate-voter-nft", async (req, res) => {
  try {
    const { 
      nft_category,
      voter_id,
      position_id
    } = req.body;

    const result = await generateVoterNFT(nft_category, voter_id, position_id);
    console.log("/nft/generate-voter-nft", result);
    
    res.json({
      success: true,
      result
    });

  } catch(error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/nft/send-nft-to-contract", async (req, res) => {
  try {
    const { 
      nft_category,
      candidate_id,
      open_time,
      close_time  
    } = req.body;
    const txid = await sendNFToContract(nft_category, candidate_id, open_time, close_time);
    if (!txid) throw new Error ('Failed to send NFT to contract!')
    console.log("/nft/send-nft-to-contract", txid);

    res.json({
      success: true,
      txid
    });

  } catch(error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/vote", async (req, res) => {
  try {
    const {
      nft_category, 
      candidate_id, 
      voter_id,
      open_time,
      close_time
    } = req.body;

    const txid = await castVote(nft_category, candidate_id, voter_id, open_time, close_time);
    if (!txid) throw new Error('Invalid Vote')

    res.json({
      success: true,
      txid
    });

  } catch(error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});

app.listen(3001, () => {
  console.log("Blockchain API running on port 3001");
});