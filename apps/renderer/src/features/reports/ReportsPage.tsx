import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useSalesReport, useProductsReport, useInventoryReport } from '../../hooks/useReports';
import { Table } from '../../components/Table';
import { fmt } from '../../utils/format';

const COLORS = ['#e85d75', '#6c5ce7', '#ffc048', '#00c853', '#29b6f6', '#ff9100'];

const DateFilter: React.FC<{ from: string; to: string; onChange: (f: string, t: string) => void }> = ({ from, to, onChange }) => {
  const setRange = (days: number) => {
    const end = new Date(); const start = new Date(Date.now() - days * 86400000);
    onChange(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {[['7d', 7], ['30d', 30], ['90d', 90]].map(([l, d]) => (
        <button key={l} className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => setRange(d as number)}>{l}</button>
      ))}
      <input type="date" className="input" value={from} onChange={e => onChange(e.target.value, to)} style={{ width: 140, fontSize: 13 }} />
      <span style={{ color: 'var(--text-muted)' }}>to</span>
      <input type="date" className="input" value={to} onChange={e => onChange(from, e.target.value)} style={{ width: 140, fontSize: 13 }} />
    </div>
  );
};

export const ReportsPage: React.FC = () => {
  const [tab, setTab] = useState<'sales' | 'products' | 'inventory'>('sales');
  const [from, setFrom] = useState(() => new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [groupBy, setGroupBy] = useState('day');

  const { data: salesData, isLoading: salesLoading } = useSalesReport(from, to, groupBy);
  const { data: productsData = [], isLoading: productsLoading } = useProductsReport(from, to);
  const { data: inventoryData = [], isLoading: invLoading } = useInventoryReport();

  const trend = salesData?.trend || [];
  const payBreakdown = salesData?.paymentBreakdown || [];
  const totals = salesData?.totals;

  const prodCols = [
    { key: 'productName', header: 'Product', render: (r: any) => <span style={{ fontWeight: 600 }}>{r.productName}</span> },
    { key: 'qty', header: 'Qty Sold', render: (r: any) => <span style={{ fontWeight: 700 }}>{Number(r.qty).toFixed(1)}</span> },
    { key: 'revenue', header: 'Revenue', render: (r: any) => <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>LKR {fmt(r.revenue)}</span> },
    { key: 'cost', header: 'Cost', render: (r: any) => <span>LKR {fmt(r.cost)}</span> },
    { key: 'profit', header: 'Profit', render: (r: any) => { const p = r.revenue - r.cost; return <span style={{ fontWeight: 700, color: p >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>LKR {fmt(p)}</span>; } },
  ];

  const invCols = [
    { key: 'name', header: 'Product', render: (r: any) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
    { key: 'category', header: 'Category', render: (r: any) => <span className="badge badge-info">{r.category || '—'}</span> },
    { key: 'stockQuantity', header: 'Stock', render: (r: any) => <span style={{ fontWeight: 700 }}>{r.stockQuantity}</span> },
    { key: 'minStockLevel', header: 'Min', render: (r: any) => <span style={{ color: 'var(--text-muted)' }}>{r.minStockLevel}</span> },
    { key: 'status', header: 'Status', render: (r: any) => <span className={`badge badge-${r.status === 'out' ? 'danger' : r.status === 'low' ? 'warning' : 'success'}`}>{r.status === 'out' ? 'Out of Stock' : r.status === 'low' ? 'Low Stock' : 'OK'}</span> },
    { key: 'stockValue', header: 'Stock Value', render: (r: any) => <span>LKR {fmt(r.stockValue)}</span> },
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, height: '100%', overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 4 }}>
          {(['sales', 'products', 'inventory'] as const).map(t => (
            <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: 13, padding: '6px 16px', border: 'none' }} onClick={() => setTab(t)}>
              {t === 'sales' ? '📈 Sales' : t === 'products' ? '📦 Products' : '📋 Inventory'}
            </button>
          ))}
        </div>
        {tab !== 'inventory' && <DateFilter from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />}
        {tab === 'sales' && (
          <select className="input" value={groupBy} onChange={e => setGroupBy(e.target.value)} style={{ width: 120, fontSize: 13 }}>
            <option value="day">By Day</option>
            <option value="week">By Week</option>
            <option value="month">By Month</option>
          </select>
        )}
      </div>

      {tab === 'sales' && (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[['Total Revenue', `LKR ${fmt(totals?.revenue || 0)}`, 'var(--color-primary)'],
              ['Transactions', String(totals?.transactions || 0), 'var(--color-success)'],
              ['Avg Transaction', `LKR ${fmt(totals?.avgTransaction || 0)}`, 'var(--color-secondary)']
            ].map(([label, value, color]) => (
              <div key={label} className="widget">
                <div className="widget-label">{label}</div>
                <div className="widget-value" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            <div className="widget">
              <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Revenue Over Time</div>
              {salesLoading ? <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading…</div> : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="period" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => [`LKR ${fmt(v)}`, 'Revenue']} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="url(#g)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="widget">
              <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Payment Methods</div>
              {payBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={payBreakdown} dataKey="amount" nameKey="method" cx="50%" cy="50%" outerRadius={80} label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {payBreakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`LKR ${fmt(v)}`]} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No data</div>}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="widget">
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Period Breakdown</div>
            <Table columns={[
              { key: 'period', header: 'Period', render: r => <span style={{ fontWeight: 600 }}>{r.period}</span> },
              { key: 'transactions', header: 'Transactions' },
              { key: 'revenue', header: 'Revenue', render: r => <span style={{ fontWeight: 700 }}>LKR {fmt(r.revenue)}</span> },
              { key: 'discount', header: 'Discounts', render: r => <span style={{ color: 'var(--color-success)' }}>LKR {fmt(r.discount)}</span> },
              { key: 'tax', header: 'Tax', render: r => <span style={{ color: 'var(--text-muted)' }}>LKR {fmt(r.tax)}</span> },
            ]} data={trend} keyField="period" />
          </div>
        </>
      )}

      {tab === 'products' && (
        <Table columns={prodCols} data={productsData as any[]} loading={productsLoading} emptyText="No sales in this period" keyField="productId" />
      )}

      {tab === 'inventory' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              ['Total Products', (inventoryData as any[]).length, '📦'],
              ['Out of Stock', (inventoryData as any[]).filter((p: any) => p.status === 'out').length, '❌'],
              ['Total Stock Value', `LKR ${fmt((inventoryData as any[]).reduce((s: number, p: any) => s + p.stockValue, 0))}`, '💰'],
            ].map(([l, v, i]) => (
              <div key={l as string} className="widget" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 32 }}>{i}</span>
                <div><div className="widget-label">{l}</div><div className="widget-value" style={{ fontSize: 24 }}>{v}</div></div>
              </div>
            ))}
          </div>
          <Table columns={invCols} data={inventoryData as any[]} loading={invLoading} emptyText="No products" />
        </>
      )}
    </div>
  );
};
