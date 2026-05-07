import { cryptoPayment } from '../httpClient';

/**
 * Wallet management
 */
export async function getCustomerWallets(userId) {
  return cryptoPayment.get(`/api/v1.0/customerWallets/${userId}`);
}

export async function addCustomerWallet(userId, walletAddress) {
  return cryptoPayment.post(`/api/v1.0/customerWallets/${userId}`, { wallet: walletAddress });
}

export async function deleteCustomerWallet(userId, walletAddress) {
  return cryptoPayment.del(`/api/v1.0/customerWallets/${userId}`, { wallet: walletAddress });
}

/**
 * Transaction management
 */
export async function createTransaction({ txhash, from, amount, productId, userId }) {
  return cryptoPayment.post('/api/v1.0/transactions', { txhash, from, amount, productId, userId });
}

export async function getTransaction(transactionId) {
  return cryptoPayment.get(`/api/v1.0/transactions/${transactionId}`);
}

export async function claimTransaction(transactionId, userId) {
  return cryptoPayment.post(`/api/v1.0/transactions/${transactionId}/claim`, { userId });
}

export async function getApprovedTransactions(userId) {
  return cryptoPayment.get(`/api/v1.0/transactions/approved/user/${userId}`);
}
