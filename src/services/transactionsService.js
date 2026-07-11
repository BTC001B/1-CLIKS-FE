import { apiClient } from '../api/client';

/**
 * Transactions Service
 */
export const transactionsService = {
    getTransactions: async (params = {}) => {
        const res = await apiClient.get('/transactions', { params });
        return res.data;
    },
    getTransactionById: async (id) => {
        const res = await apiClient.get(`/transactions/${id}`);
        return res.data;
    },
    createTransaction: async (data) => {
        const res = await apiClient.post('/transactions', data);
        return res.data;
    },
    updateTransaction: async (id, data) => {
        const res = await apiClient.patch(`/transactions/${id}`, data);
        return res.data;
    },
    deleteTransaction: async (id) => {
        const res = await apiClient.delete(`/transactions/${id}`);
        return res.data;
    }
};

export default transactionsService;
