import api from './api';

export const financePlusService = {
  // Financial Goals
  getGoals: () => api.get('/finance-plus/goals').then(res => res.data),
  createGoal: (data) => api.post('/finance-plus/goals', data).then(res => res.data),
  updateGoal: (id, data) => api.put(`/finance-plus/goals/${id}`, data).then(res => res.data),
  deleteGoal: (id) => api.delete(`/finance-plus/goals/${id}`).then(res => res.data),

  // Salary
  getSalaryRecords: () => api.get('/finance-plus/salary').then(res => res.data),
  createSalaryRecord: (data) => api.post('/finance-plus/salary', data).then(res => res.data),

  // Property
  getPropertyRecords: () => api.get('/finance-plus/property').then(res => res.data),
  createProperty: (data) => api.post('/finance-plus/property', data).then(res => res.data),
  recordRent: (id, data) => api.post(`/finance-plus/property/${id}/rent`, data).then(res => res.data),

  // Pension
  getPensionRecords: () => api.get('/finance-plus/pension').then(res => res.data),
  recordPension: (data) => api.post('/finance-plus/pension', data).then(res => res.data),

  // Tax
  getTaxRecords: () => api.get('/finance-plus/tax').then(res => res.data),
  saveTaxRecord: (data) => api.post('/finance-plus/tax', data).then(res => res.data),

  // Notifications
  getNotifications: () => api.get('/finance-plus/notifications').then(res => res.data),
  markRead: (id) => api.put(`/finance-plus/notifications/${id}/read`).then(res => res.data),

  // Profile Role
  updateIncomeSource: (source) => api.put('/finance-plus/primary-income', { source }).then(res => res.data)
};
