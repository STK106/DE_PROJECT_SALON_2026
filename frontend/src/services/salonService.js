import api from './api';

export const salonService = {
  getAll: (params) => api.get('/salons', { params }),
  getById: (id) => api.get(`/salons/${id}`),
  getMySalon: (salonId) => api.get('/salons/owner/my-salon', {
    params: salonId ? { salon_id: salonId } : undefined,
  }),
  getStats: (salonId) => api.get('/salons/owner/stats', {
    params: salonId ? { salon_id: salonId } : undefined,
  }),
  create: (data) => api.post('/salons', data),
  update: (data, salonId) => api.put('/salons', {
    ...data,
    ...(salonId ? { salon_id: salonId } : {}),
  }),
  uploadImages: (formData, salonId) => api.post('/salons/images', formData, {
    params: salonId ? { salon_id: salonId } : undefined,
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteImage: (index, salonId) => api.delete(`/salons/images/${index}`, {
    params: salonId ? { salon_id: salonId } : undefined,
  }),
  rateSalon: (id, bookingId, rating) => api.post(`/salons/${id}/rate`, { booking_id: bookingId, rating }),
  getBlockedSlots: (salonId) => api.get('/salons/availability/blocked', {
    params: salonId ? { salon_id: salonId } : undefined,
  }),
  addBlockedSlot: (data, salonId) => api.post('/salons/availability/block', {
    ...data,
    ...(salonId ? { salon_id: salonId } : {}),
  }),
  removeBlockedSlot: (id, salonId) => api.delete(`/salons/availability/block/${id}`, {
    params: salonId ? { salon_id: salonId } : undefined,
  }),
};

export const serviceService = {
  getBySalon: (salonId) => api.get(`/services/salon/${salonId}`),
  getMyServices: (salonId) => api.get('/services/my-services', {
    params: salonId ? { salon_id: salonId } : undefined,
  }),
  create: (data, salonId) => api.post('/services', {
    ...data,
    ...(salonId ? { salon_id: salonId } : {}),
  }),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const staffService = {
  getBySalon: (salonId) => api.get(`/staff/salon/${salonId}`),
  getMyStaff: (salonId) => api.get('/staff/my-staff', {
    params: salonId ? { salon_id: salonId } : undefined,
  }),
  create: (data, salonId) => api.post('/staff', {
    ...data,
    ...(salonId ? { salon_id: salonId } : {}),
  }),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

export const productService = {
  getBySalon: (salonId) => api.get(`/products/salon/${salonId}`),
  getMyProducts: (salonId) => api.get('/products/my-products', {
    params: salonId ? { salon_id: salonId } : undefined,
  }),
  create: (data, salonId) => {
    if (data instanceof FormData) {
      if (salonId) data.append('salon_id', salonId);
      return api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    return api.post('/products', {
      ...data,
      ...(salonId ? { salon_id: salonId } : {}),
    });
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put(`/products/${id}`, data);
  },
  delete: (id) => api.delete(`/products/${id}`),
  rateProduct: (id, rating, comment) => api.post(`/products/${id}/rate`, { rating, comment }),
};

export const productOrderService = {
  createCheckout: (data) => api.post('/product-orders/checkout', data),
  getMyOrders: (params) => api.get('/product-orders/my-orders', { params }),
  getSalonOrders: (params) => api.get('/product-orders/salon-orders', { params }),
  getById: (id) => api.get(`/product-orders/${id}`),
  updateStatus: (id, order_status) => api.put(`/product-orders/${id}/status`, { order_status }),
};
