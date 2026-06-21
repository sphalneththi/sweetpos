import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../hooks/useUsers';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../../hooks/useSuppliers';
import { Modal } from '../../components/Modal';
import { Table } from '../../components/Table';
import { useAuthStore } from '../../stores/auth.store';
import { fmtDateTime } from '../../utils/format';

/* ─── User Form ─── */
const UserForm: React.FC<{ initial?: any; onSave: (d: any) => Promise<void>; onClose: () => void }> = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState({ username: '', fullName: '', email: '', password: '', role: 'cashier', isActive: true, ...initial });
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  return (
    <Modal open onClose={onClose} title={initial ? 'Edit User' : 'Add User'} size="sm"
      footer={<><button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button><button className="btn btn-primary" onClick={async () => {
        if (!form.username || !form.fullName) { toast.error('Username and full name are required'); return; }
        if (!initial && !form.password) { toast.error('Password is required for new users'); return; }
        setSaving(true);
        try {
          const payload: any = { username: form.username, fullName: form.fullName, email: form.email || undefined, role: form.role, isActive: form.isActive };
          if (form.password) payload.password = form.password;
          await onSave(payload); onClose();
        } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
      }} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group"><label className="form-label">Username *</label><input className="input" value={form.username} onChange={set('username')} autoFocus disabled={!!initial} /></div>
        <div className="form-group"><label className="form-label">Full Name *</label><input className="input" value={form.fullName} onChange={set('fullName')} /></div>
        <div className="form-group"><label className="form-label">Email</label><input className="input" type="email" value={form.email} onChange={set('email')} /></div>
        <div className="form-group"><label className="form-label">{initial ? 'New Password (leave blank to keep)' : 'Password *'}</label><input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" /></div>
        <div className="form-group"><label className="form-label">Role</label><select className="input" value={form.role} onChange={set('role')}><option value="admin">Admin</option><option value="cashier">Cashier</option></select></div>
        {initial && <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}><input type="checkbox" checked={form.isActive} onChange={set('isActive')} />Active</label>}
      </div>
    </Modal>
  );
};

/* ─── Supplier Form ─── */
const SupplierForm: React.FC<{ initial?: any; onSave: (d: any) => Promise<void>; onClose: () => void }> = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '', notes: '', ...initial });
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open onClose={onClose} title={initial ? 'Edit Supplier' : 'Add Supplier'} size="md"
      footer={<><button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button><button className="btn btn-primary" onClick={async () => {
        if (!form.name.trim()) { toast.error('Supplier name is required'); return; }
        setSaving(true); try { await onSave(form); onClose(); } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
      }} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Supplier Name *</label><input className="input" value={form.name} onChange={set('name')} autoFocus /></div>
        <div className="form-group"><label className="form-label">Contact Person</label><input className="input" value={form.contactPerson} onChange={set('contactPerson')} /></div>
        <div className="form-group"><label className="form-label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
        <div className="form-group"><label className="form-label">Email</label><input className="input" type="email" value={form.email} onChange={set('email')} /></div>
        <div className="form-group"><label className="form-label">Address</label><input className="input" value={form.address} onChange={set('address')} /></div>
        <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={set('notes') as any} /></div>
      </div>
    </Modal>
  );
};

export const SettingsPage: React.FC = () => {
  const [tab, setTab] = useState<'users' | 'suppliers' | 'account'>('users');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showSupForm, setShowSupForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingSup, setEditingSup] = useState<any>(null);
  const [supSearch, setSupSearch] = useState('');
  const { user } = useAuthStore();

  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: suppliers = [], isLoading: suppLoading } = useSuppliers(supSearch);
  const createUser = useCreateUser(); const updateUser = useUpdateUser(); const deleteUser = useDeleteUser();
  const createSup = useCreateSupplier(); const updateSup = useUpdateSupplier(); const deleteSup = useDeleteSupplier();

  const handleSaveUser = async (d: any) => {
    if (editingUser) await updateUser.mutateAsync({ id: editingUser.id, ...d });
    else await createUser.mutateAsync(d);
    toast.success(editingUser ? 'User updated' : 'User created');
  };
  const handleSaveSup = async (d: any) => {
    if (editingSup) await updateSup.mutateAsync({ id: editingSup.id, ...d });
    else await createSup.mutateAsync(d);
    toast.success(editingSup ? 'Supplier updated' : 'Supplier created');
  };

  const userCols = [
    { key: 'fullName', header: 'Name', render: (r: any) => <div><div style={{ fontWeight: 600 }}>{r.fullName}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.username}</div></div> },
    { key: 'role', header: 'Role', render: (r: any) => <span className={`badge badge-${r.role === 'admin' ? 'danger' : 'info'}`}>{r.role.toUpperCase()}</span> },
    { key: 'isActive', header: 'Status', render: (r: any) => <span className={`badge badge-${r.isActive ? 'success' : 'warning'}`}>{r.isActive ? 'Active' : 'Inactive'}</span> },
    { key: 'lastLogin', header: 'Last Login', render: (r: any) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.lastLogin ? fmtDateTime(r.lastLogin) : 'Never'}</span> },
    { key: 'actions', header: '', render: (r: any) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={e => { e.stopPropagation(); setEditingUser(r); setShowUserForm(true); }}>Edit</button>
        {r.id !== user?.id && <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, color: 'var(--color-danger)' }} onClick={async e => { e.stopPropagation(); if (confirm(`Delete user "${r.username}"?`)) { await deleteUser.mutateAsync(r.id); toast.success('User deleted'); }}}>Del</button>}
      </div>
    )},
  ];

  const supCols = [
    { key: 'name', header: 'Name', render: (r: any) => <div><div style={{ fontWeight: 600 }}>{r.name}</div>{r.contactPerson && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.contactPerson}</div>}</div> },
    { key: 'phone', header: 'Phone', render: (r: any) => <span style={{ color: 'var(--text-muted)' }}>{r.phone || '—'}</span> },
    { key: 'email', header: 'Email', render: (r: any) => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.email || '—'}</span> },
    { key: 'actions', header: '', render: (r: any) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={e => { e.stopPropagation(); setEditingSup(r); setShowSupForm(true); }}>Edit</button>
        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, color: 'var(--color-danger)' }} onClick={async e => { e.stopPropagation(); if (confirm(`Delete "${r.name}"?`)) { await deleteSup.mutateAsync(r.id); toast.success('Supplier deleted'); }}}>Del</button>
      </div>
    )},
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, height: '100%', overflow: 'auto' }}>
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 4, alignSelf: 'flex-start' }}>
        {(['users', 'suppliers', 'account'] as const).map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: 13, padding: '6px 16px', border: 'none', textTransform: 'capitalize' }} onClick={() => setTab(t)}>
            {t === 'users' ? '👥 Users' : t === 'suppliers' ? '🏭 Suppliers' : '👤 My Account'}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => { setEditingUser(null); setShowUserForm(true); }}>+ Add User</button>
          </div>
          <Table columns={userCols} data={users as any[]} loading={usersLoading} emptyText="No users" />
        </>
      )}

      {tab === 'suppliers' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input className="input input-search" placeholder="Search suppliers…" value={supSearch} onChange={e => setSupSearch(e.target.value)} style={{ maxWidth: 280 }} />
            <div style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={() => { setEditingSup(null); setShowSupForm(true); }}>+ Add Supplier</button>
          </div>
          <Table columns={supCols} data={suppliers as any[]} loading={suppLoading} emptyText="No suppliers yet" />
        </>
      )}

      {tab === 'account' && (
        <div style={{ maxWidth: 480 }}>
          <div className="widget">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 28, color: 'white' }}>{user?.fullName?.[0]?.toUpperCase()}</div>
              <div><div style={{ fontWeight: 700, fontSize: 20 }}>{user?.fullName}</div><div style={{ color: 'var(--text-muted)', fontSize: 14 }}>@{user?.username}</div><span className={`badge badge-${user?.role === 'admin' ? 'danger' : 'info'}`} style={{ marginTop: 6, display: 'inline-flex' }}>{user?.role?.toUpperCase()}</span></div>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '12px 16px', background: 'var(--bg-surface-hover)', borderRadius: 10 }}>
              To change your password, use the <strong>Change Password</strong> option from the profile menu, or contact your administrator.
            </div>
          </div>
        </div>
      )}

      {showUserForm && <UserForm initial={editingUser} onSave={handleSaveUser} onClose={() => { setShowUserForm(false); setEditingUser(null); }} />}
      {showSupForm && <SupplierForm initial={editingSup} onSave={handleSaveSup} onClose={() => { setShowSupForm(false); setEditingSup(null); }} />}
    </div>
  );
};
