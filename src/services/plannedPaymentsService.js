import { apiClient } from '../api/client';

/**
 * Planned Payments Service
 */
export const plannedPaymentsService = {
    getPlannedPayments: async () => {
        // return await apiClient.get('/planned-payments');
        const res = await apiClient.get('/planned-payments');
        return res.data; // ✅ only array return
    },
    createPlannedPayment: async (data) => {
        return await apiClient.post('/planned-payments', data);
    },
    updatePlannedPayment: async (id, data) => {
        return await apiClient.put(`/planned-payments/${id}`, data);
    },
    deletePlannedPayment: async (id) => {
        return await apiClient.delete(`/planned-payments/${id}`);
    },

    // Extended wrappers matching the business app payment planner service structure
    getPayments: async (params) => await apiClient.get('/planned-payments', { params }).then(res => res.data.data || res.data),
    getPayment: async (id) => await apiClient.get(`/planned-payments/${id}`).then(res => res.data.data || res.data),
    createPayment: async (data) => await apiClient.post('/planned-payments', data).then(res => res.data.data || res.data),
    updatePayment: async (id, data) => await apiClient.patch(`/planned-payments/${id}`, data).then(res => res.data.data || res.data),
    markAsPaid: async (id) => await apiClient.patch(`/planned-payments/${id}/mark-paid`).then(res => res.data.data || res.data),
    deletePayment: async (id) => await apiClient.delete(`/planned-payments/${id}`).then(res => res.data.data || res.data)
};

export default plannedPaymentsService;
