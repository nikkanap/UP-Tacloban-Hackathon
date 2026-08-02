import { TestNetWallet } from 'mainnet-js';
import { SignatureTemplate } from 'cashscript';
// Wallet for mainnet

export async function getWalletFromWIF(wif, network) {
  const wallet = await TestNetWallet.fromWIF(
    wif,
    network
  );
  return wallet;
}

export function getTemplateFromWIFCS(wif) {
  const template = new SignatureTemplate(wif);
  return template;
}