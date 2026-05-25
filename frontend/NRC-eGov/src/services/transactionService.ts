import api from './api';

export const transactionService = {
  // Get NRC transactions
  getTransactions: (nrcId: string, limit: number = 50) =>
    api.get(`/transactions/${nrcId}?limit=${limit}`),

  // Verify transaction
  verifyTransaction: (transactionId: string) =>
    api.get(`/transactions/${transactionId}/verify`),

  // Verify transaction chain
  verifyChain: (nrcId: string) =>
    api.get(`/transactions/${nrcId}/chain/verify`),

  // Get transaction summary
  getSummary: (nrcId: string) =>
    api.get(`/transactions/${nrcId}/summary`),
};
