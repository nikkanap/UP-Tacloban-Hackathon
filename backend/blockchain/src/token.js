// handles both FTs and NFTs (we can create one category for both FTs/NFTs)
export async function generateTokenCategory(wallet, amount, nft) {
  const result = await wallet.tokenGenesis({
    ...(amount != null && { amount }),
    ...(nft != null && { nft }),
  });

  if (!result.categories?.[0]) {
    throw new Error("Token genesis succeeded but no category was returned");
  }
  return result.categories?.[0];
}


