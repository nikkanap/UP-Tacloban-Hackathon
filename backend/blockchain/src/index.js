import express from "express";
import {
  generateElectionNFT,
  generateCandidateNFT,
  generateVoterNFT,
  sendNFToContract,
  castVote
} from "./election.js";

const app = express();

app.set("json replacer", (_key, value) =>
  typeof value === "bigint" ? value.toString() : value
);

app.use(express.json());

function toJsonSafe(value) {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(toJsonSafe);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, toJsonSafe(item)])
  );
}

function sendSuccess(res, payload) {
  res.json(toJsonSafe({
    success: true,
    ...payload,
  }));
}

function serializeError(error) {
  const aggregateErrors = error?.errors;

  if (Array.isArray(aggregateErrors) && aggregateErrors.length > 0) {
    const details = aggregateErrors.map((item) => item?.message || String(item));
    const websocketFailure = details.every(
      (message) =>
        message.includes("WebSocket error") ||
        message.includes("Connection was closed before it was established")
    );

    return {
      error: websocketFailure
        ? "Blockchain network unavailable. Could not connect to any configured chipnet Electrum server."
        : error?.message || "Multiple blockchain operations failed.",
      details,
    };
  }

  return {
    error: error?.message || String(error),
  };
}

function sendError(res, error) {
  const payload = serializeError(error);
  console.error(payload.error, payload.details || error);

  res.status(500).json(toJsonSafe({
    success: false,
    ...payload,
  }));
}

process.on("unhandledRejection", (reason) => {
  const payload = serializeError(reason);
  console.error("Unhandled blockchain rejection:", payload.error, payload.details || reason);
});

app.post("/nft/generate-election-nft", async (req, res) => {
  try {
    const { election_id } = req.body;

    const result = await generateElectionNFT(election_id);
    console.log("/nft/generate-election-nft", result);
    sendSuccess(res, {
      result
    });

  } catch(error) {
    sendError(res, error);
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

    sendSuccess(res, {
      result
    });

  } catch(error) {
    sendError(res, error);
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
    
    sendSuccess(res, {
      result
    });

  } catch(error) {
    sendError(res, error);
  }
});

app.post("/nft/send-nft-to-contract", async (req, res) => {
  try {
    const { 
      nft_category,
      candidate_id,
      position_id,
      open_time,
      close_time  
    } = req.body;
    const result = await sendNFToContract(nft_category, candidate_id, open_time, close_time, position_id);
    if (!result) throw new Error ('Failed to send NFT to contract!')
    console.log("/nft/send-nft-to-contract", result);

    sendSuccess(res, {
      txId: result.txId
    });

  } catch(error) {
    sendError(res, error);
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

    const result = await castVote(nft_category, candidate_id, voter_id, open_time, close_time);
    const txid = result?.txid || result;
    if (!txid) throw new Error('Invalid Vote')

    sendSuccess(res, {
      txid
    });

  } catch(error) {
    sendError(res, error);
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
