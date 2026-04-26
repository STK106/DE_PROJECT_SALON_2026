import api from './api';

export const salonService = {
  getAll: (params) => api.get('/salons', { params }),
  getById: (id) => api.get(`/salons/${id}`),
  getMySalon: (salonId) => api.get('/salons/owner/my-salon', { params: salonId ? { salon_id: salonId } : undefined }),
  getStats: () => api.get('/salons/owner/stats'),
  create: (data) => api.post('/salons', data),
  update: (data) => api.put('/salons', data),
  uploadImages: (formData) => api.post('/salons/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteImage: (index) => api.delete(`/salons/images/${index}`),
  rateSalon: (id, rating, bookingId = null) => api.post(`/salons/${id}/rate`, {
    rating,
    ...(bookingId ? { booking_id: bookingId } : {}),
  }),
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
  getMyStaff: (salonId) => api.get('/staff/my-staff', { params: salonId ? { salon_id: salonId } : undefined }),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

export const productService = {
  getBySalon: (salonId) => api.get(`/products/salon/${salonId}`),
  getMyProducts: (salonId) => api.get('/products/my-products', { params: salonId ? { salon_id: salonId } : undefined }),
  create: (formData, salonId) => {
    if (salonId) formData.append('salon_id', salonId);
    return api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  update: (id, formData) => api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
  rateProduct: (id, rating) => api.post(`/products/${id}/rate`, { rating }),
};

export const productOrderService = {
  createCheckout: (data) => api.post('/product-orders/checkout', data),
  getMyOrders: () => api.get('/product-orders/my-orders'),
  getSalonOrders: (params) => api.get('/product-orders/salon-orders', { params }),
  getById: (id) => api.get(`/product-orders/${id}`),
  updateStatus: (id, order_status) => api.put(`/product-orders/${id}/status`, { order_status }),
};
