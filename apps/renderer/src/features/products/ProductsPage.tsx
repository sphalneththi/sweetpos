import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../hooks/useProducts';
import { useCategories, useCreateCategory, useUpdateCategory } from '../../hooks/useCategories';
import { Modal } from '../../components/Modal';
import { Table } from '../../components/Table';
import { fmt } from '../../utils/format';

/* ─── Product Form ─── */
const ProductForm: React.FC<{ initial?: any; categories: any[]; onSave: (d: any) => Promise<void>; onClose: () => void }> = ({ initial, categories, onSave, onClose }) => {
  const [form, setForm] = useState({ name: '', barcode: '', sku: '', description: '', categoryId: '', sellingPrice: initial?.sellingPrice || '', costPrice: initial?.costPrice || '', stockQuantity: initial?.stockQuantity || '', minStockLevel: initial?.minStockLevel || '', unitType: 'piece', taxRate: '0', imageUrl: '', ...initial });
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.sellingPrice || !form.costPrice) { toast.error('Name, selling price and cost price are required'); return; }
    setSaving(true);
    try {
      await onSave({ ...form, sellingPrice: parseFloat(form.sellingPrice), costPrice: parseFloat(form.costPrice), stockQuantity: parseFloat(form.stockQuantity) || 0, minStockLevel: parseFloat(form.minStockLevel) || 0, taxRate: parseFloat(form.taxRate) || 0, categoryId: form.categoryId || undefined, barcode: form.barcode || undefined, sku: form.sku || undefined });
      onClose();
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  const F = ({ label, k, type = 'text', placeholder = '' }: { label: string; k: string; type?: string; placeholder?: string }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="input" type={type} placeholder={placeholder} value={(form as any)[k]} onChange={set(k)} />
    </div>
  );

  return (
    <Modal open onClose={onClose} title={initial ? 'Edit Product' : 'Add Product'} size="lg"
      footer={<><button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button></>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group" style={{ gridColumn: '1/-1' }}>
          <label className="form-label">Product Name *</label>
          <input className="input" placeholder="e.g. Chocolate Cake" value={form.name} onChange={set('name')} autoFocus />
        </div>
        <F label="Barcode" k="barcode" placeholder="Scan or type barcode" />
        <F label="SKU" k="sku" placeholder="Internal code" />
        <F label="Selling Price (LKR) *" k="sellingPrice" type="number" placeholder="0.00" />
        <F label="Cost Price (LKR) *" k="costPrice" type="number" placeholder="0.00" />
        <F label="Stock Quantity" k="stockQuantity" type="number" placeholder="0" />
        <F label="Min Stock Level" k="minStockLevel" type="number" placeholder="0" />
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="input" value={form.categoryId} onChange={set('categoryId')}>
            <option value="">— No Category —</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Unit Type</label>
          <select className="input" value={form.unitType} onChange={set('unitType')}>
            {['piece','kg','g','l','ml','pack','box','dozen'].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <F label="Tax Rate (%)" k="taxRate" type="number" placeholder="0" />
        <F label="Image / Emoji" k="imageUrl" placeholder="🍬 or image URL" />
        <div className="form-group" style={{ gridColumn: '1/-1' }}>
          <label className="form-label">Description</label>
          <textarea className="input" rows={2} placeholder="Optional description" value={form.description} onChange={set('description') as any} />
        </div>
      </div>
    </Modal>
  );
};

/* ─── Category Form ─── */
const CategoryForm: React.FC<{ initial?: any; onSave: (d: any) => Promise<void>; onClose: () => void }> = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState({ name: '', description: '', color: '#e85d75', icon: '', sortOrder: '0', ...initial });
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open onClose={onClose} title={initial ? 'Edit Category' : 'Add Category'} size="sm"
      footer={<><button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button><button className="btn btn-primary" onClick={async () => { setSaving(true); try { await onSave({ ...form, sortOrder: parseInt(form.sortOrder) }); onClose(); } catch (e: any) { toast.error(e.message); } finally { setSaving(false); } }} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group"><label className="form-label">Name *</label><input className="input" value={form.name} onChange={set('name')} autoFocus /></div>
        <div className="form-group"><label className="form-label">Icon (emoji)</label><input className="input" value={form.icon} onChange={set('icon')} placeholder="🍰" /></div>
        <div className="form-group"><label className="form-label">Color</label><input type="color" value={form.color} onChange={set('color')} style={{ width: '100%', height: 44, border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', padding: 4, background: 'var(--bg-input)' }} /></div>
        <div className="form-group"><label className="form-label">Sort Order</label><input className="input" type="number" value={form.sortOrder} onChange={set('sortOrder')} /></div>
      </div>
    </Modal>
  );
};

/* ─── Main Page ─── */
export const ProductsPage: React.FC = () => {
  const [tab, setTab] = useState<'products' | 'categories'>('products');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [editingCat, setEditingCat] = useState<any>(null);

  const { data: productsData, isLoading } = useProducts(undefined, search, page, 50);
  const products = productsData?.data ?? [];
  const totalPages = productsData?.totalPages ?? 1;
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const handleSaveProduct = async (d: any) => {
    if (editing) await updateProduct.mutateAsync({ id: editing.id, ...d });
    else await createProduct.mutateAsync(d);
    toast.success(editing ? 'Product updated' : 'Product created');
  };

  const handleSaveCategory = async (d: any) => {
    if (editingCat) await updateCategory.mutateAsync({ id: editingCat.id, ...d });
    else await createCategory.mutateAsync(d);
    toast.success(editingCat ? 'Category updated' : 'Category created');
  };

  const productCols = [
    { key: 'imageUrl', header: '', width: '48px', render: (r: any) => <span style={{ fontSize: 24 }}>{r.imageUrl || '📦'}</span> },
    { key: 'name', header: 'Product', render: (r: any) => <div><div style={{ fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.barcode || r.sku || '—'}</div></div> },
    { key: 'category', header: 'Category', render: (r: any) => <span className="badge badge-info">{r.category?.name || '—'}</span> },
    { key: 'sellingPrice', header: 'Price', render: (r: any) => <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>LKR {fmt(r.sellingPrice)}</span> },
    { key: 'costPrice', header: 'Cost', render: (r: any) => <span>LKR {fmt(r.costPrice)}</span> },
    { key: 'stockQuantity', header: 'Stock', render: (r: any) => {
      const qty = Number(r.stockQuantity), min = Number(r.minStockLevel);
      return <span className={`badge ${qty <= 0 ? 'badge-danger' : qty <= min ? 'badge-warning' : 'badge-success'}`}>{qty <= 0 ? 'OUT' : qty}</span>;
    }},
    { key: 'actions', header: '', render: (r: any) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={e => { e.stopPropagation(); setEditing(r); setShowForm(true); }}>Edit</button>
        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, color: 'var(--color-danger)' }} onClick={async e => { e.stopPropagation(); if (confirm(`Delete "${r.name}"?`)) { await deleteProduct.mutateAsync(r.id); toast.success('Product deleted'); }}}>Del</button>
      </div>
    )},
  ];

  const catCols = [
    { key: 'icon', header: '', width: '48px', render: (r: any) => <span style={{ fontSize: 22 }}>{r.icon || '📁'}</span> },
    { key: 'name', header: 'Category', render: (r: any) => <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 14, height: 14, borderRadius: '50%', background: r.color || 'var(--color-primary)', flexShrink: 0 }} /><span style={{ fontWeight: 600 }}>{r.name}</span></div> },
    { key: 'sortOrder', header: 'Order' },
    { key: 'actions', header: '', render: (r: any) => <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => { setEditingCat(r); setShowCatForm(true); }}>Edit</button> },
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, height: '100%', overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 4 }}>
          {(['products', 'categories'] as const).map(t => (
            <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: 13, padding: '6px 16px', border: 'none' }} onClick={() => setTab(t)}>
              {t === 'products' ? '📦 Products' : '🏷 Categories'}
            </button>
          ))}
        </div>
        <input className="input input-search" placeholder="Search…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 300 }} />
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => { setEditing(null); tab === 'products' ? setShowForm(true) : setShowCatForm(true); }}>
          + Add {tab === 'products' ? 'Product' : 'Category'}
        </button>
      </div>

      {tab === 'products' ? (
        <>
          <Table columns={productCols} data={products} loading={isLoading} emptyText="No products found" />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`btn ${p === page ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '4px 10px', fontSize: 12, minWidth: 32 }} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        </>
      ) : (
        <Table columns={catCols} data={categories as any[]} loading={false} emptyText="No categories yet" />
      )}

      {showForm && <ProductForm initial={editing} categories={categories as any[]} onSave={handleSaveProduct} onClose={() => { setShowForm(false); setEditing(null); }} />}
      {showCatForm && <CategoryForm initial={editingCat} onSave={handleSaveCategory} onClose={() => { setShowCatForm(false); setEditingCat(null); }} />}
    </div>
  );
};
