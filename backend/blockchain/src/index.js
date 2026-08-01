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
    const { mutable } = req.body;

    const result = await generateElectionNFT(mutable);

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
    const { mutable } = req.body;

    const result = await generateCandidateNFT(mutable);

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
    const { mutable } = req.body;

    const result = await generateVoterNFT(mutable);

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

app.post("/contract/fund", async (req, res) => {
  try {
    const txid = await sendNFToContract();

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
    const txid = await castVote();

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