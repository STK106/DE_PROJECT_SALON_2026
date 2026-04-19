import api from './api';

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  getSalons: (params) => api.get('/admin/salons', { params }),
  approveSalon: (id, approved) => api.put(`/admin/salons/${id}/approve`, { approved }),
  getBookings: (params) => api.get('/admin/bookings', { params }),
};
