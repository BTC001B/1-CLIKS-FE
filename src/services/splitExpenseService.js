import { apiClient } from '../api/client';

/**
 * Split Expense / Split & Collect Service
 */
export const splitExpenseService = {
    getSplits: async () => await apiClient.get('/split-expenses').then(res => res?.data || res),
    getSummary: async () => await apiClient.get('/split-expenses/summary').then(res => res?.data || res),
    settleFriend: async (name) => await apiClient.patch('/split-expenses/settle-friend', { name }).then(res => res?.data || res),
    getSplitById: async (id) => await apiClient.get(`/split-expenses/${id}`).then(res => res?.data || res),
    createSplit: async (data) => await apiClient.post('/split-expenses', data).then(res => res?.data || res),
    updateSplit: async (id, data) => await apiClient.patch(`/split-expenses/${id}`, data).then(res => res?.data || res),
    deleteSplit: async (id) => await apiClient.delete(`/split-expenses/${id}`).then(res => res?.data || res),

    // Participants
    getParticipants: async (splitId) => await apiClient.get(`/split-expenses/${splitId}/participants`).then(res => res?.data || res),
    addParticipant: async (splitId, data) => await apiClient.post(`/split-expenses/${splitId}/participants`, data).then(res => res?.data || res),
    updateParticipant: async (splitId, participantId, data) => await apiClient.patch(`/split-expenses/${splitId}/participants/${participantId}`, data).then(res => res?.data || res),
    deleteParticipant: async (splitId, participantId) => await apiClient.delete(`/split-expenses/${splitId}/participants/${participantId}`).then(res => res?.data || res),
    settleParticipant: async (splitId, participantId) => await apiClient.patch(`/split-expenses/${splitId}/participants/${participantId}/settle`).then(res => res?.data || res),
    
    // Expenses
    addExpense: async (splitId, data) => await apiClient.post(`/split-expenses/${splitId}/expenses`, data).then(res => res?.data || res),
    deleteExpense: async (splitId, expenseId) => await apiClient.delete(`/split-expenses/${splitId}/expenses/${expenseId}`).then(res => res?.data || res),
};

export default splitExpenseService;

