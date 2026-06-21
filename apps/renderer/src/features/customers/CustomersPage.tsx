import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useCustomers, useCreateCustomer, useUpdateCustomer } from '../../hooks/useCustomers';
import { Modal } from '../../components/Modal';
import { Table } from '../../components/Table';
import { fmt, fmtDate } from '../../utils/format';

const CustomerForm: React.FC<{ initial?: any; onSave: (d: any) => Promise<void>; onClose: () => void }> = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', ...initial });
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open onClose={onClose} title={initial ? 'Edit Customer' : 'Add Customer'} size="sm"
      footer={<><button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button><button className="btn btn-primary" onClick={async () => { if (!form.name.trim()) { toast.error('Name is required'); return; } setSaving(true); try { await onSave(form); onClose(); } catch (e: any) { toast.error(e.message); } finally { setSaving(false); } }} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group"><label className="form-label">Full Name *</label><input className="input" value={form.name} onChange={set('name')} autoFocus placeholder="Customer name" /></div>
        <div className="form-group"><label className="form-label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} placeholder="+94-XX-XXXXXXX" /></div>
        <div className="form-group"><label className="form-label">Email</label><input className="input" type="email" value={form.email} onChange={set('email')} placeholder="customer@email.com" /></div>
        <div className="form-group"><label className="form-label">Address</label><textarea className="input" rows={2} value={form.address} onChange={set('address') as any} placeholder="Full address" /></div>
      </div>
    </Modal>
  );
};

export const CustomersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewCustomer, setViewCustomer] = useState<any>(null);

  const { data, isLoading } = useCustomers(search, page);
  const customers = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const handleSave = async (d: any) => {
    if (editing) await updateCustomer.mutateAsync({ id: editing.id, ...d });
    else await createCustomer.mutateAsync(d);
    toast.success(editing ? 'Customer updated' : 'Customer added');
  };

  const cols = [
    { key: 'avatar', header: '', width: '48px', render: (r: any) => <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--color-secondary)', fontSize: 15 }}>{r.name[0].toUpperCase()}</div> },
    { key: 'name', header: 'Customer', render: (r: any) => <div><div style={{ fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.phone || r.email || '—'}</div></div> },
    { key: 'loyaltyPoints', header: 'Loyalty Pts', render: (r: any) => <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>⭐ {r.loyaltyPoints}</span> },
    { key: 'totalSpent', header: 'Total Spent', render: (r: any) => <span style={{ fontWeight: 600 }}>LKR {fmt(r.totalSpent)}</span> },
    { key: 'visitCount', header: 'Visits' },
    { key: 'lastVisit', header: 'Last Visit', render: (r: any) => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.lastVisit ? fmtDate(r.lastVisit) : '—'}</span> },
    { key: 'actions', header: '', render: (r: any) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={e => { e.stopPropagation(); setViewCustomer(r); }}>View</button>
        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={e => { e.stopPropagation(); setEditing(r); setShowForm(true); }}>Edit</button>
      </div>
    )},
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, height: '100%', overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input className="input input-search" placeholder="Search customers…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 320 }} />
        <div style={{ flex: 1 }} />
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{data?.total ?? 0} customers</span>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Customer</button>
      </div>

      <Table columns={cols} data={customers} loading={isLoading} emptyText="No customers yet" onRowClick={r => setViewCustomer(r)} />

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
            <button key={p} className={`btn ${p === page ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '4px 10px', fontSize: 12, minWidth: 32 }} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}

      {showForm && <CustomerForm initial={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}

      {viewCustomer && (
        <Modal open onClose={() => setViewCustomer(null)} title="Customer Details" size="sm"
          footer={<><button className="btn btn-ghost" onClick={() => setViewCustomer(null)}>Close</button><button className="btn btn-primary" onClick={() => { setEditing(viewCustomer); setViewCustomer(null); setShowForm(true); }}>Edit</button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--color-secondary)', fontSize: 28 }}>{viewCustomer.name[0].toUpperCase()}</div>
              <div><div style={{ fontWeight: 700, fontSize: 20 }}>{viewCustomer.name}</div><div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{viewCustomer.phone} {viewCustomer.email ? `· ${viewCustomer.email}` : ''}</div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[['⭐ Loyalty', `${viewCustomer.loyaltyPoints} pts`], ['💰 Spent', `LKR ${fmt(viewCustomer.totalSpent)}`], ['🛍 Visits', viewCustomer.visitCount]].map(([l, v]) => (
                <div key={l as string} style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-surface-hover)', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
            {viewCustomer.address && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-surface-hover)', fontSize: 13, color: 'var(--text-muted)' }}>📍 {viewCustomer.address}</div>}
            {viewCustomer.lastVisit && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last visit: {fmtDate(viewCustomer.lastVisit)}</div>}
          </div>
        </Modal>
      )}
    </div>
  );
};
