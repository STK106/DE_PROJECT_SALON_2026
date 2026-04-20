import api from './api';

export const salonService = {
  getAll: (params) => api.get('/salons', { params }),
  getById: (id) => api.get(`/salons/${id}`),
  getMySalon: () => api.get('/salons/owner/my-salon'),
  getStats: () => api.get('/salons/owner/stats'),
  create: (data) => api.post('/salons', data),
  update: (data) => api.put('/salons', data),
  uploadImages: (formData) => api.post('/salons/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteImage: (index) => api.delete(`/salons/images/${index}`),
  rateSalon: (id, bookingId, rating) => api.post(`/salons/${id}/rate`, { booking_id: bookingId, rating }),
  getBlockedSlots: () => api.get('/salons/availability/blocked'),
  addBlockedSlot: (data) => api.post('/salons/availability/block', data),
  removeBlockedSlot: (id) => api.delete(`/salons/availability/block/${id}`),
};

export const serviceService = {
  getBySalon: (salonId) => api.get(`/services/salon/${salonId}`),
  getMyServices: () => api.get('/services/my-services'),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const staffService = {
  getBySalon: (salonId) => api.get(`/staff/salon/${salonId}`),
  getMyStaff: () => api.get('/staff/my-staff'),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};
