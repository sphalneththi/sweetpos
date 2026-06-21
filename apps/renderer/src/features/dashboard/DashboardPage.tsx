import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useDashboard } from '../../hooks/useDashboard';
import { useLowStock } from '../../hooks/useInventory';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '@sweetpos/shared-types';
import { fmt, fmtDate } from '../../utils/format';

const Widget: React.FC<{ label: string; value: string; sub?: string; color?: string; icon: string }> = ({ label, value, sub, color = 'var(--color-primary)', icon }) => (
  <div className="widget animate-fade-in">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div className="widget-label">{label}</div>
        <div className="widget-value" style={{ color }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ fontSize: 28, opacity: 0.7 }}>{icon}</div>
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { data, isLoading } = useDashboard();
  const { data: lowStock = [] } = useLowStock();
  const { user } = useAuthStore();
  const isAdmin = user?.role === UserRole.ADMIN;

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
      <div>Loading dashboard…</div>
    </div>
  );

  if (!isAdmin) return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <Widget label="Today's Sales" value={`LKR ${fmt(data?.todaySales || 0)}`} icon="💰" color="var(--color-success)" />
        <Widget label="Today's Transactions" value={String(data?.todayTransactions || 0)} icon="🧾" />
        <Widget label="Avg Transaction" value={`LKR ${fmt(data?.averageTransactionValue || 0)}`} icon="📊" color="var(--color-secondary)" />
      </div>
    </div>
  );

  const trend = data?.revenueTrend || [];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto', height: '100%' }}>
      {/* KPI Widgets */}
      <div className="dashboard-grid">
        <Widget label="Today's Revenue" value={`LKR ${fmt(data?.todaySales || 0)}`} sub={`${data?.todayTransactions || 0} transactions`} icon="💰" color="var(--color-success)" />
        <Widget label="Monthly Revenue" value={`LKR ${fmt(data?.monthlySales || 0)}`} icon="📅" color="var(--color-primary)" />
        <Widget label="Total Products" value={String(data?.totalProducts || 0)} icon="📦" />
        <Widget label="Low Stock Alerts" value={String(data?.lowStockItems || 0)} sub={`${data?.outOfStockItems || 0} out of stock`} icon="⚠️" color={data?.lowStockItems > 0 ? 'var(--color-warning)' : undefined} />
      </div>

      {/* Revenue Chart + Top Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="widget">
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Revenue Trend (Last 30 Days)</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={d => d ? d.slice(5) : ''} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`LKR ${fmt(v)}`, 'Revenue']} labelStyle={{ color: 'var(--text-primary)' }} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="widget">
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Top Products</div>
          {(data?.topProducts || []).length === 0
            ? <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40, fontSize: 13 }}>No sales yet</div>
            : (data?.topProducts || []).map((p: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.productName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.quantity} sold · LKR {fmt(p.revenue)}</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Low Stock Table */}
      {lowStock.length > 0 && (
        <div className="widget">
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15, color: 'var(--color-warning)' }}>⚠️ Low Stock Alert ({lowStock.length})</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {lowStock.slice(0, 12).map((p: any) => (
              <div key={p.id} style={{ padding: '10px 14px', borderRadius: 10, border: `1px solid ${p.stockQuantity <= 0 ? 'var(--color-danger)' : 'var(--color-warning)'}`, background: p.stockQuantity <= 0 ? 'var(--color-danger-light)' : 'var(--color-warning-light)' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 12, marginTop: 2, color: p.stockQuantity <= 0 ? 'var(--color-danger)' : 'var(--color-warning)', fontWeight: 700 }}>
                  {p.stockQuantity <= 0 ? 'OUT OF STOCK' : `${p.stockQuantity} left`} (min: {p.minStockLevel})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
