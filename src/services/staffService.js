import api from './api';

export const getStaffMembers = () => api.get('/admin/staff');
