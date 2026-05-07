/* global BigInt */

export const SEPOLIA_CHAIN_ID = process.env.REACT_APP_SEPOLIA_CHAIN_ID || '11155111';
export const MERCHANT_ADDRESS = process.env.REACT_APP_CRYPTO_WALLET || '0x537d599C58dD439AB62659D0478a50f52B88D24f';

export function isMetaMaskAvailable() {
  return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
}

export async function requestMetaMaskAccount() {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (!accounts.length) throw new Error('No MetaMask account connected');
  return accounts[0];
}

export async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x' + parseInt(SEPOLIA_CHAIN_ID).toString(16) }],
    });
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x' + parseInt(SEPOLIA_CHAIN_ID).toString(16),
          chainName: 'Sepolia test network',
          nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://rpc.sepolia.org'],
        }],
      });
    } else {
      throw err;
    }
  }
}

export async function sendMetaMaskTransaction({ to, amountUsd, ethPriceUsd }) {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  await switchToSepolia();
  const from = await requestMetaMaskAccount();
  const amountEth = Number(amountUsd) / ethPriceUsd;
  const amountWei = '0x' + BigInt(Math.round(amountEth * 1e18)).toString(16);
  const amountWeiDecimal = String(Math.round(amountEth * 1e18));
  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [{ from, to, value: amountWei }],
  });
  return { txHash, from, amountWei: amountWeiDecimal };
}
