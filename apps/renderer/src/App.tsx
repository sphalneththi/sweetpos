import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/auth.store';
import { LoginPage } from './features/auth/LoginPage';
import { POSPage } from './features/pos/POSPage';
import { UserRole } from '@sweetpos/shared-types';

// Icons as simple text for now (will be replaced with react-icons)
const NAV_ITEMS = [
  { path: '/pos', label: 'POS', icon: '🛒', roles: [UserRole.ADMIN, UserRole.CASHIER] },
  { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: [UserRole.ADMIN] },
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

  const visibleItems = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role as UserRole),
  );

  return (
    <nav className="sidebar">
      <div className="sidebar-logo" title="SweetPOS">🍬</div>

      {visibleItems.map((item) => (
        <button
          key={item.path}
          className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}

      <div className="sidebar-spacer" />

      <button
        className="sidebar-item"
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <button
        className="sidebar-item"
        onClick={logout}
        title="Logout"
        style={{ color: 'var(--color-danger)' }}
      >
        🚪
      </button>
    </nav>
  );
};

const TopHeader: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const currentPage = NAV_ITEMS.find((item) => item.path === location.pathname);

  return (
    <header className="top-header">
      <h1 className="header-title">{currentPage?.label || 'SweetPOS'}</h1>
      <div className="header-actions">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}
        >
          <div className="badge badge-success" id="sync-status">
            ● Online
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--bg-surface-hover)',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <span>👤</span>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
              {user?.fullName}
            </span>
            <span
              className="badge badge-info"
              style={{ fontSize: '0.65rem', padding: '1px 6px' }}
            >
              {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

// Placeholder pages
const PlaceholderPage: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
  <div
    className="p-6"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 'var(--space-4)',
    }}
  >
    <span style={{ fontSize: '4rem' }}>{icon}</span>
    <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>{title}</h2>
    <p className="text-muted">Coming soon — this module is under development</p>
  </div>
);

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopHeader />
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/pos" element={<POSPage />} />
            <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" icon="📊" />} />
            <Route path="/products" element={<PlaceholderPage title="Product Management" icon="📦" />} />
            <Route path="/inventory" element={<PlaceholderPage title="Inventory Management" icon="📋" />} />
            <Route path="/customers" element={<PlaceholderPage title="Customer Management" icon="👥" />} />
            <Route path="/reports" element={<PlaceholderPage title="Reports" icon="📈" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" icon="⚙️" />} />
            <Route path="*" element={<Navigate to="/pos" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
