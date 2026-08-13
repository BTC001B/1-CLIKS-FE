import { apiClient } from '../api/client';

export const financePlusService = {
  // Financial Goals
  getGoals: () => apiClient.get('/finance-plus/goals').then(res => res.data),
  createGoal: (data) => apiClient.post('/finance-plus/goals', data).then(res => res.data),
  updateGoal: (id, data) => apiClient.put(`/finance-plus/goals/${id}`, data).then(res => res.data),
  deleteGoal: (id) => apiClient.delete(`/finance-plus/goals/${id}`).then(res => res.data),

  // Salary
  getSalaryRecords: () => apiClient.get('/finance-plus/salary').then(res => res.data),
  createSalaryRecord: (data) => apiClient.post('/finance-plus/salary', data).then(res => res.data),

  // Property
  getPropertyRecords: () => apiClient.get('/finance-plus/property').then(res => res.data),
  createProperty: (data) => apiClient.post('/finance-plus/property', data).then(res => res.data),
  recordRent: (id, data) => apiClient.post(`/finance-plus/property/${id}/rent`, data).then(res => res.data),

  // Pension
  getPensionRecords: () => apiClient.get('/finance-plus/pension').then(res => res.data),
  recordPension: (data) => apiClient.post('/finance-plus/pension', data).then(res => res.data),

  // Tax
  getTaxRecords: () => apiClient.get('/finance-plus/tax').then(res => res.data),
  saveTaxRecord: (data) => apiClient.post('/finance-plus/tax', data).then(res => res.data),

  // Notifications
  getNotifications: () => apiClient.get('/finance-plus/notifications').then(res => res.data),
  markRead: (id) => apiClient.put(`/finance-plus/notifications/${id}/read`).then(res => res.data),

  // Profile Role & Budget
  updateSettings: (data) => apiClient.put('/finance-plus/settings', data).then(res => res.data),
  updateIncomeSource: (source) => apiClient.put('/finance-plus/primary-income', { source }).then(res => res.data),

  // Money Trackers
  getMoneyTrackers: (params) => apiClient.get('/finance-plus/money-trackers', { params }).then(res => res.data),
  createMoneyTracker: (data) => apiClient.post('/finance-plus/money-trackers', data).then(res => res.data),
  getMoneyTrackerById: (id) => apiClient.get(`/finance-plus/money-trackers/${id}`).then(res => res.data),
  updateMoneyTracker: (id, data) => apiClient.put(`/finance-plus/money-trackers/${id}`, data).then(res => res.data),
  deleteMoneyTracker: (id) => apiClient.delete(`/finance-plus/money-trackers/${id}`).then(res => res.data),

  // Customer Purchase History & Loyalty
  getPurchases: () => apiClient.get('/finance-plus/purchases').then(res => res.data),
  getLoyaltyStats: () => apiClient.get('/finance-plus/loyalty').then(res => res.data),
  getInvoiceDetails: (id) => apiClient.get(`/finance-plus/invoice/${id}`).then(res => res.data),

  // Active Integrations / Business Connections
  getIntegrations: () => apiClient.get('/finance-plus/integrations').then(res => res.data),
  respondIntegration: (id, action) => apiClient.post(`/finance-plus/integrations/${id}/respond`, { action }).then(res => res.data),

  // Supplier Portal Workflow & Communication
  getSupplierConnectionRequests: () => apiClient.get('/suppliers/portal/connection-requests').then(res => res.data),
  respondSupplierConnectionRequest: (id, action) => apiClient.post(`/suppliers/portal/connection-requests/${id}/respond`, { action }).then(res => res.data),
  getSupplierPurchaseRequests: () => apiClient.get('/suppliers/portal/purchase-requests').then(res => res.data),
  getSupplierPurchaseOrderDetails: (id) => apiClient.get(`/suppliers/portal/purchase-requests/${id}`).then(res => res.data),
  confirmSupplierPurchaseOrder: (id) => apiClient.post(`/suppliers/portal/purchase-requests/${id}/confirm`).then(res => res.data),
  getSupplierChatMessages: (supplierId) => apiClient.get(`/suppliers/portal/chat/${supplierId}`).then(res => res.data),
  sendSupplierChatMessage: (supplierId, data) => apiClient.post(`/suppliers/portal/chat/${supplierId}`, data).then(res => res.data)
};

export default financePlusService;
