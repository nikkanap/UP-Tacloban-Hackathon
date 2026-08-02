import { TokenSendRequest } from "mainnet-js";

export async function sendBCHToAddress(senderWallet, receiverAddress, amountSat) {
  const txid = await senderWallet.send([
    {
      cashaddr: receiverAddress,  // address of contract
      value: amountSat,           // amount to send in satoshis
    }
  ]);
  console.log(`BCH sent to address ${receiverAddress}`)
  return txid;
}

export async function sendTokenToAddress(
  senderWallet, 
  receiverAddress, 
  token,
  tokenSat=1000n,
  utxo,
) {
  const request = new TokenSendRequest({
    cashaddr: receiverAddress,  // address of contract
    value: tokenSat,       
    category: token.category,     // amount to send in satoshis
    amount: token.amount ?? 0n,
    nft: token.nft
  });
  const options = utxo ? { ensureUtxos: [utxo] } : undefined;
  const txid = await senderWallet.send([request], options);
  console.log(`Token sent to address ${receiverAddress}`)
  return txid;
}
