import api from './api';

export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  getAvailableSlots: (salonId, params) => api.get(`/bookings/slots/${salonId}`, { params }),
  // Shopkeeper
  getSalonBookings: (params) => api.get('/bookings/salon/all', { params }),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
};
