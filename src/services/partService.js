import api from './api';

export const getParts = () => api.get('/admin/parts');

export const createPart = (data) => api.post('/admin/parts', data);

export const updatePart = (id, data) => api.put(`/admin/parts/${id}`, data);

export const deletePart = (id) => api.delete(`/admin/parts/${id}`);

export const purchaseParts = (data) => api.post('/admin/purchases', data);
