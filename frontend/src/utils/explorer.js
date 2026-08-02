// The contract runs on chipnet (backend/blockchain/src/election.js: NETWORK),
// so txids only resolve on a chipnet explorer — a mainnet explorer will report
// "not found" for every ballot.
const EXPLORER_TX_URL =
  import.meta.env.VITE_EXPLORER_TX_URL ?? "https://chipnet.imaginary.cash/tx/";

export const explorerTxUrl = (txid) =>
  txid ? `${EXPLORER_TX_URL}${encodeURIComponent(txid)}` : null;

// Full txids are 64 hex chars — too long to show raw in a table cell.
export const shortTxid = (txid, size = 8) => {
  if (!txid) return "—";
  return txid.length <= size * 2 + 1
    ? txid
    : `${txid.slice(0, size)}…${txid.slice(-size)}`;
};
