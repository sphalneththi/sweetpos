import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/auth.store';
import { LoginPage } from './features/auth/LoginPage';
import { POSPage } from './features/pos/POSPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProductsPage } from './features/products/ProductsPage';
import { InventoryPage } from './features/inventory/InventoryPage';
import { CustomersPage } from './features/customers/CustomersPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { UserRole } from '@sweetpos/shared-types';

const NAV_ITEMS = [
  { path: '/pos', label: 'POS', icon: '🛒', roles: [UserRole.ADMIN, UserRole.CASHIER] },
  { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: [UserRole.ADMIN, UserRole.CASHIER] },
  { path: '/products', label: 'Products', icon: '📦', roles: [UserRole.ADMIN] },
  { path: '/inventory', label: 'Inventory', icon: '📋', roles: [UserRole.ADMIN] },
  { path: '/customers', label: 'Customers', icon: '👥', roles: [UserRole.ADMIN, UserRole.CASHIER] },
  { path: '/reports', label: 'Reports', icon: '📈', roles: [UserRole.ADMIN] },
  { path: '/settings', label: 'Settings', icon: '⚙️', roles: [UserRole.ADMIN] },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, toggleTheme, theme } = useAuthStore();
  const visible = NAV_ITEMS.filter(item => user && item.roles.includes(user.role as UserRole));

  return (
    <nav className="sidebar">
      <div className="sidebar-logo" title="SweetPOS">🍬</div>
      {visible.map(item => (
        <button key={item.path} className={`sidebar-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
          onClick={() => navigate(item.path)} title={item.label}>
          {item.icon}
        </button>
      ))}
      <div className="sidebar-spacer" />
      <button className="sidebar-item" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <button className="sidebar-item" onClick={logout} title="Logout" style={{ color: 'var(--color-danger)' }}>🚪</button>
    </nav>
  );
};

const TopHeader: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const current = NAV_ITEMS.find(item => location.pathname.startsWith(item.path));
  return (
    <header className="top-header">
      <h1 className="header-title">{current ? `${current.icon} ${current.label}` : 'SweetPOS'}</h1>
      <div className="header-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="badge badge-success">● Online</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-full)' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 12 }}>{user?.fullName?.[0]?.toUpperCase()}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{user?.fullName}</span>
            <span className={`badge badge-${user?.role === 'admin' ? 'danger' : 'info'}`} style={{ fontSize: 10, padding: '1px 6px' }}>{user?.role?.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopHeader />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/pos" element={<POSPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={isAdmin ? <ProductsPage /> : <Navigate to="/pos" />} />
            <Route path="/inventory" element={isAdmin ? <InventoryPage /> : <Navigate to="/pos" />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/reports" element={isAdmin ? <ReportsPage /> : <Navigate to="/pos" />} />
            <Route path="/settings" element={isAdmin ? <SettingsPage /> : <Navigate to="/pos" />} />
            <Route path="*" element={<Navigate to="/pos" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
    <Toaster position="top-right" toastOptions={{
      style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 14 },
      success: { iconTheme: { primary: 'var(--color-success)', secondary: 'white' } },
      error: { iconTheme: { primary: 'var(--color-danger)', secondary: 'white' } },
    }} />
  </QueryClientProvider>
);

export default App;
