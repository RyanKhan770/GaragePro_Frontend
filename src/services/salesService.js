import api from './api';

export const createSale = (data) => api.post('/staff/sales', data);

export const getSaleByOrderId = (orderId) => api.get(`/staff/sales/${orderId}`);
