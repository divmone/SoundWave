import { payment } from '../httpClient';

export async function createCheckoutSession(userId, productId, amount, currency, productTitle) {
  return payment.post('/api/payment/checkout', {
    userId,
    productId,
    amount: String(amount),
    currency,
    productTitle,
  });
}

export async function confirmPayment(paymentIntentId) {
  return payment.post('/api/payment/confirm', { paymentIntentId });
}

export async function getPayment(id) {
  return payment.get(`/api/payment/${id}`);
}

export async function getUserPayments(userId) {
  return payment.get(`/api/payment/user/${userId}`);
}

export async function getUserPurchases(userId) {
  return payment.get(`/api/payment/purchases/user/${userId}`);
}

export async function checkPurchaseAccess(userId, productId) {
  return payment.get(`/api/payment/purchases/access/${userId}/${productId}`);
}

export async function getUserPaymentMethods(userId) {
  return payment.get(`/api/payment/methods/user/${userId}`);
}

export async function createPaymentMethod(userId, stripeCustomerId, stripePaymentMethodId, cardData, isDefault = false) {
  return payment.post('/api/payment/methods', {
    userId,
    stripeCustomerId,
    stripePaymentMethodId,
    isDefault,
    cardBrand: cardData.brand || '',
    cardLast4: cardData.last4 || '',
    expMonth: cardData.expMonth || 0,
    expYear: cardData.expYear || 0,
    cardHolderName: cardData.holderName || '',
  });
}

export async function setDefaultPaymentMethod(methodId, userId) {
  return payment.post(`/api/payment/methods/${methodId}/default`, { userId });
}

export async function deletePaymentMethod(methodId) {
  return payment.del(`/api/payment/methods/${methodId}`);
}