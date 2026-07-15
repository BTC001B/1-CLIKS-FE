import { apiClient } from '../api/client';

/**
 * Home Service
 */
export const homeService = {
    getHomeStats: async () => {
        const res = await apiClient.get('/home');
        return res.data;
    },
    getBooksDashboardData: async () => {
        const res = await apiClient.get('/home/books');
        return res.data;
    }
};

export default homeService;
