import { cryptoPayment } from '../httpClient';

/**
 * Wallet management
 */
export async function getCustomerWallets(userId) {
  return cryptoPayment.get(`/customerWallets/${userId}`);
}

export async function addCustomerWallet(userId, walletAddress) {
  return cryptoPayment.post(`/customerWallets/${userId}`, { wallet: walletAddress });
}

export async function deleteCustomerWallet(userId, walletAddress) {
  return cryptoPayment.del(`/customerWallets/${userId}`, { wallet: walletAddress });
}

/**
 * Transaction management
 */
export async function createTransaction({ txhash, from, amount, productId, userId }) {
  return cryptoPayment.post('/transactions', { txhash, from, amount, productId, userId });
}

export async function getTransaction(transactionId) {
  return cryptoPayment.get(`/transactions/${transactionId}`);
}

export async function claimTransaction(transactionId, userId) {
  return cryptoPayment.post(`/transactions/${transactionId}/claim`, { userId });
}
