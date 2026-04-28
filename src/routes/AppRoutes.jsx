import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import PartsManagementPage from '../pages/admin/PartsManagementPage';
import AppointmentsPage from '../pages/customer/AppointmentsPage';
import ReviewsPage from '../pages/customer/ReviewsPage';
import UnavailablePartsPage from '../pages/customer/UnavailablePartsPage';
import CustomerDetailsPage from '../pages/staff/CustomerDetailsPage';
import RegisterCustomerPage from '../pages/staff/RegisterCustomerPage';
import SalesInvoicesPage from '../pages/staff/SalesInvoicesPage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/admin/parts" element={<PartsManagementPage />} />
        <Route path="/staff/register-customer" element={<RegisterCustomerPage />} />
        <Route path="/staff/customers" element={<CustomerDetailsPage />} />
        <Route path="/staff/sales" element={<SalesInvoicesPage />} />
        <Route path="/customer/appointments" element={<AppointmentsPage />} />
        <Route path="/customer/unavailable-parts" element={<UnavailablePartsPage />} />
        <Route path="/customer/reviews" element={<ReviewsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
