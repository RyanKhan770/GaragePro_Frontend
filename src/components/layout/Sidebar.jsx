import { NavLink } from 'react-router-dom';
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  Package,
  Star,
  UserPlus,
  Users,
  Wrench,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', to: '/', Icon: LayoutDashboard },
  { label: 'Parts Management', to: '/admin/parts', Icon: Package },
  { label: 'Register Customer', to: '/staff/register-customer', Icon: UserPlus },
  { label: 'Customer Details', to: '/staff/customers', Icon: Users },
  { label: 'Sales Invoices', to: '/staff/sales', Icon: FileText },
  { label: 'Appointments', to: '/customer/appointments', Icon: CalendarDays },
  { label: 'Part Requests', to: '/customer/unavailable-parts', Icon: Wrench },
  { label: 'Reviews', to: '/customer/reviews', Icon: Star },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        width: '220px',
        minHeight: '100vh',
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '20px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          G
        </div>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>GaragePro</span>
      </div>

      <nav style={{ flex: 1, padding: '12px 12px' }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#9ca3af',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '8px 8px 4px',
          }}
        >
          Main
        </p>

        {navItems.map(({ label, to, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 8,
              marginBottom: 2,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#4f46e5' : '#374151',
              background: isActive ? '#eef2ff' : 'transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} color={isActive ? '#4f46e5' : '#6b7280'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
