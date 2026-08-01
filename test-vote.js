// test-vote.js  --  one valid vote, run against the real VM with fake utxos.
// node test-vote.js     (package.json needs "type": "module")
import {
  Contract,
  MockNetworkProvider,
  TransactionBuilder,
  SignatureTemplate,
} from "cashscript";
import {
  secp256k1,
  hash160,
  encodeCashAddress,
  hexToBin,
} from "@bitauth/libauth";
import artifact from "./Vote.json" with { type: "json" };

const CAT = "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90"; // genesis txid, big-endian
const rev = (h) => h.match(/../g).reverse().join(""); // introspection sees little-endian -> reverse for the constructor
const OPEN = 100n; // openTime (block height)

const priv = hexToBin(
  "0000000000000000000000000000000000000000000000000000000000000001",
);
const addr = encodeCashAddress({
  prefix: "bchtest",
  type: "p2pkh",
  payload: hash160(secp256k1.derivePublicKeyCompressed(priv)),
}).address;
const sig = new SignatureTemplate(priv);

const provider = new MockNetworkProvider();
const contract = new Contract(artifact, [rev(CAT), OPEN], { provider });
console.log("contract:", contract.tokenAddress);

// commitment = candidateId(4B) + count(8B). count is a VM number = LITTLE-ENDIAN,
// so 0 is "0000000000000000" and 1 is "0100000000000000" (not ...0001).
const tok = (capability, commitment) => ({
  category: CAT,
  amount: 0n,
  nft: { capability, commitment },
});

const tally = {
  txid: "11".repeat(32),
  vout: 0,
  satoshis: 1000n,
  token: tok("mutable", "00000001" + "0000000000000000"),
};

const cred = {
  txid: "22".repeat(32),
  vout: 0,
  satoshis: 1000n,
  token: tok("none", ""),
};
const fee = { txid: "33".repeat(32), vout: 0, satoshis: 10000n };

const tx = await new TransactionBuilder({ provider });
tx.addInput(tally, contract.unlock.castVote()); // input 0: candidate tally
tx.addInput(cred, sig.unlockP2PKH()); // input 1: credential, burned
tx.addInput(fee, sig.unlockP2PKH()); // input 2: plain BCH for fee

tx.addOutput({
  to: contract.tokenAddress,
  amount: 1000n,
  token: tok("mutable", "00000001" + "0100000000000000"),
});
tx.addOutput({ to: addr, amount: 9000n }); // change, no token

tx.setLocktime(150); // CLTV reads this; omit it and every vote fails
tx.debug(); // runs the VM, throws if a require() fails

console.log("PASS — valid vote accepted, count 0 -> 1");
