import api from './api';

export const getCustomers = () => api.get('/customers');

export const getCustomerById = (id) => api.get(`/customers/${id}`);

export const registerCustomer = (data) => api.post('/customers/register', data);
