// handles both FTs and NFTs (we can create one category for both FTs/NFTs)
export async function generateTokenCategory(wallet, amount, nft) {
  return await wallet.tokenGenesis({
    ...(amount != null && { amount }),
    ...(nft != null && { nft }),
  });

  /*
    this is what it's sposed to look like:
    amount: amount or null,
    nft: {
      capability: NFTCapability.mutable/minting/etc.,
      commitment: Uint8Array.from([0]),
    } or,
  */
}


