import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useInventoryMovements, useLowStock, useRecordMovement } from '../../hooks/useInventory';
import { useProducts } from '../../hooks/useProducts';
import { useSuppliers } from '../../hooks/useSuppliers';
import { Modal } from '../../components/Modal';
import { Table } from '../../components/Table';
import { fmt, fmtDateTime } from '../../utils/format';

const MOVEMENT_TYPES = ['stock_in', 'stock_out', 'adjustment', 'damaged', 'transfer'];

const StockMovementForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [form, setForm] = useState({ productId: '', movementType: 'stock_in', quantity: '', unitCost: '', supplierId: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const { data: productsData } = useProducts(undefined, undefined, 1, 500);
  const products = productsData?.data ?? [];
  const { data: suppliers = [] } = useSuppliers();
  const record = useRecordMovement();
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const selectedProduct = products.find((p: any) => p.id === form.productId);

  const handleSave = async () => {
    if (!form.productId || !form.quantity) { toast.error('Product and quantity required'); return; }
    setSaving(true);
    try {
      await record.mutateAsync({ productId: form.productId, movementType: form.movementType, quantity: parseFloat(form.quantity), unitCost: form.unitCost ? parseFloat(form.unitCost) : undefined, supplierId: form.supplierId || undefined, notes: form.notes || undefined });
      toast.success('Stock movement recorded');
      onClose();
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="Record Stock Movement" size="md"
      footer={<><button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Record'}</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Product *</label>
          <select className="input" value={form.productId} onChange={set('productId')} autoFocus>
            <option value="">— Select Product —</option>
            {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>)}
          </select>
        </div>
        {selectedProduct && <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--bg-surface-hover)', fontSize: 13, color: 'var(--text-muted)' }}>Current Stock: <strong style={{ color: 'var(--text-primary)' }}>{selectedProduct.stockQuantity} {selectedProduct.unitType}</strong></div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Movement Type *</label>
            <select className="input" value={form.movementType} onChange={set('movementType')}>
              {MOVEMENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input className="input" type="number" step="0.001" placeholder="0" value={form.quantity} onChange={set('quantity')} />
          </div>
          {form.movementType === 'stock_in' && <>
            <div className="form-group">
              <label className="form-label">Unit Cost (LKR)</label>
              <input className="input" type="number" step="0.01" placeholder="0.00" value={form.unitCost} onChange={set('unitCost')} />
            </div>
            <div className="form-group">
              <label className="form-label">Supplier</label>
              <select className="input" value={form.supplierId} onChange={set('supplierId')}>
                <option value="">— None —</option>
                {(suppliers as any[]).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </>}
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="input" rows={2} placeholder="Reason or notes…" value={form.notes} onChange={set('notes') as any} />
        </div>
      </div>
    </Modal>
  );
};

export const InventoryPage: React.FC = () => {
  const [tab, setTab] = useState<'movements' | 'low-stock'>('movements');
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const { data: movementsData, isLoading } = useInventoryMovements(undefined, page);
  const movements = movementsData?.data ?? [];
  const totalPages = movementsData?.totalPages ?? 1;
  const { data: lowStock = [] } = useLowStock();

  const movCols = [
    { key: 'createdAt', header: 'Date', render: (r: any) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDateTime(r.createdAt)}</span> },
    { key: 'product', header: 'Product', render: (r: any) => <span style={{ fontWeight: 600 }}>{r.product?.name || r.productId}</span> },
    { key: 'movementType', header: 'Type', render: (r: any) => {
      const colors: Record<string, string> = { stock_in: 'success', stock_out: 'danger', adjustment: 'info', damaged: 'warning', sale: 'danger' };
      return <span className={`badge badge-${colors[r.movementType] || 'info'}`}>{r.movementType.replace('_', ' ')}</span>;
    }},
    { key: 'quantity', header: 'Qty', render: (r: any) => <span style={{ fontWeight: 700 }}>{r.quantity}</span> },
    { key: 'previousStock', header: 'Before', render: (r: any) => <span style={{ color: 'var(--text-muted)' }}>{r.previousStock}</span> },
    { key: 'newStock', header: 'After', render: (r: any) => <span style={{ fontWeight: 600, color: Number(r.newStock) <= 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{r.newStock}</span> },
    { key: 'user', header: 'By', render: (r: any) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.user?.fullName || '—'}</span> },
    { key: 'notes', header: 'Notes', render: (r: any) => <span style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 160, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</span> },
  ];

  const lowStockCols = [
    { key: 'name', header: 'Product', render: (r: any) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
    { key: 'category', header: 'Category', render: (r: any) => <span className="badge badge-info">{r.category?.name || '—'}</span> },
    { key: 'stockQuantity', header: 'Current Stock', render: (r: any) => <span className={`badge ${Number(r.stockQuantity) <= 0 ? 'badge-danger' : 'badge-warning'}`}>{Number(r.stockQuantity) <= 0 ? 'OUT OF STOCK' : r.stockQuantity}</span> },
    { key: 'minStockLevel', header: 'Min Level' },
    { key: 'unitType', header: 'Unit', render: (r: any) => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.unitType}</span> },
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, height: '100%', overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 4 }}>
          <button className={`btn ${tab === 'movements' ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: 13, padding: '6px 16px', border: 'none' }} onClick={() => setTab('movements')}>📋 Movements</button>
          <button className={`btn ${tab === 'low-stock' ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: 13, padding: '6px 16px', border: 'none' }} onClick={() => setTab('low-stock')}>
            ⚠️ Low Stock {(lowStock as any[]).length > 0 && <span style={{ marginLeft: 6, background: 'var(--color-danger)', borderRadius: 99, color: 'white', fontSize: 11, padding: '1px 6px' }}>{(lowStock as any[]).length}</span>}
          </button>
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Record Movement</button>
      </div>

      {tab === 'movements' ? (
        <>
          <Table columns={movCols} data={movements} loading={isLoading} emptyText="No movements recorded yet" />
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`btn ${p === page ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '4px 10px', fontSize: 12, minWidth: 32 }} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          )}
        </>
      ) : (
        <Table columns={lowStockCols} data={lowStock as any[]} loading={false} emptyText="✅ All products have sufficient stock" />
      )}

      {showForm && <StockMovementForm onClose={() => setShowForm(false)} />}
    </div>
  );
};
