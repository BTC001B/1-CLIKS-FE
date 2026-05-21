import { apiClient } from '../api/client';

export const calculatorService = {
  getHistory: async () => {
    const res = await apiClient.get('/calculator/history');
    return res.data;
  },
  saveHistory: async (data) => {
    const res = await apiClient.post('/calculator/history', data);
    return res.data;
  },
  deleteHistoryItem: async (id) => {
    const res = await apiClient.delete(`/calculator/history/${id}`);
    return res.data;
  },
  clearHistory: async () => {
    const res = await apiClient.delete('/calculator/history');
    return res.data;
  }
};

export default calculatorService;
