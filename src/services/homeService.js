import { apiClient } from '../api/client';

/**
 * Home Service
 */
export const homeService = {
    getHomeStats: async () => {
        return await apiClient.get('/home');
    },
    getBooksDashboardData: async () => {
        return await apiClient.get('/home/books');
    }
};

export default homeService;
