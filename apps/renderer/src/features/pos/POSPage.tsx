import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '../../stores/cart.store';
import { useAuthStore } from '../../stores/auth.store';
import { PaymentMethod, DiscountType } from '@sweetpos/shared-types';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useCustomers } from '../../hooks/useCustomers';
import { useCreateSale } from '../../hooks/useSales';
import { Modal } from '../../components/Modal';
import { BarcodeScanner } from '../../components/BarcodeScanner';
import { fmt } from '../../utils/format';

/* ─── Payment Modal ──────────────────────────────────────────────── */
const PaymentModal: React.FC<{
  open: boolean; onClose: () => void;
  total: number; paymentMethod: PaymentMethod;
  onConfirm: (cashReceived?: number) => void;
  loading: boolean;
}> = ({ open, onClose, total, paymentMethod, onConfirm, loading }) => {
  const [cashReceived, setCashReceived] = useState('');
  const change = paymentMethod === PaymentMethod.CASH ? Math.max(0, parseFloat(cashReceived || '0') - total) : 0;
  const quickAmounts = [total, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);

  useEffect(() => { if (open) setCashReceived(paymentMethod === PaymentMethod.CASH ? String(Math.ceil(total / 100) * 100) : ''); }, [open, total, paymentMethod]);

  return (
    <Modal open={open} onClose={onClose} title="Complete Payment" size="sm"
      footer={<>
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
        <button className="btn btn-primary btn-lg" onClick={() => onConfirm(paymentMethod === PaymentMethod.CASH ? parseFloat(cashReceived) : undefined)} disabled={loading || (paymentMethod === PaymentMethod.CASH && parseFloat(cashReceived || '0') < total)}>
          {loading ? 'Processing…' : '✓ Confirm Payment'}
        </button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'var(--color-primary-light)', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Total Amount</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-primary)' }}>LKR {fmt(total)}</div>
        </div>
        <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--bg-surface-hover)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Payment Method</span>
          <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{paymentMethod}</span>
        </div>
        {paymentMethod === PaymentMethod.CASH && <>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Cash Received</label>
            <input className="input input-lg" type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} autoFocus style={{ textAlign: 'right', fontSize: 24, fontWeight: 700 }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {quickAmounts.map(a => <button key={a} className="btn btn-ghost" style={{ flex: 1, fontSize: 13 }} onClick={() => setCashReceived(String(a))}>{fmt(a)}</button>)}
            </div>
          </div>
          <div style={{ background: 'var(--color-success-light)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>Change</span>
            <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--color-success)' }}>LKR {fmt(change)}</span>
          </div>
        </>}
      </div>
    </Modal>
  );
};

/* ─── Customer Search Modal ────────────────────────────────────────── */
const CustomerModal: React.FC<{ open: boolean; onClose: () => void; onSelect: (c: any | null) => void; selectedId: string | null }> = ({ open, onClose, onSelect, selectedId }) => {
  const [search, setSearch] = useState('');
  const { data } = useCustomers(search, 1, 20);
  const customers = data?.data ?? [];
  return (
    <Modal open={open} onClose={onClose} title="Select Customer" size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input className="input input-search" placeholder="Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
        <button className="btn btn-ghost w-full" onClick={() => { onSelect(null); onClose(); }}>🚫 No Customer (Walk-in)</button>
        {customers.map(c => (
          <button key={c.id} onClick={() => { onSelect(c); onClose(); }}
            className="btn btn-ghost w-full"
            style={{ justifyContent: 'flex-start', gap: 12, padding: '10px 14px', borderColor: selectedId === c.id ? 'var(--color-primary)' : undefined, background: selectedId === c.id ? 'var(--color-primary-light)' : undefined }}>
            <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-secondary)', flexShrink: 0 }}>
              {c.name[0].toUpperCase()}
            </span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.phone} · {c.loyaltyPoints} pts</div>
            </div>
          </button>
        ))}
        {customers.length === 0 && search && <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>No customers found</div>}
      </div>
    </Modal>
  );
};

/* ─── Discount Modal ──────────────────────────────────────────────── */
const DiscountModal: React.FC<{ open: boolean; onClose: () => void; onApply: (type: DiscountType, value: number) => void; current: { type: DiscountType | null; value: number } }> = ({ open, onClose, onApply, current }) => {
  const [type, setType] = useState<DiscountType>(current.type || DiscountType.PERCENTAGE);
  const [value, setValue] = useState(String(current.value || ''));
  return (
    <Modal open={open} onClose={onClose} title="Apply Discount" size="sm"
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onApply(type, parseFloat(value) || 0); onClose(); }}>Apply</button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[DiscountType.PERCENTAGE, DiscountType.FIXED].map(t => (
            <button key={t} className={`btn ${type === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setType(t)}>
              {t === DiscountType.PERCENTAGE ? '% Percentage' : 'LKR Fixed'}
            </button>
          ))}
        </div>
        <input className="input input-lg" type="number" placeholder={type === DiscountType.PERCENTAGE ? 'e.g. 10 (for 10%)' : 'e.g. 500'} value={value} onChange={e => setValue(e.target.value)} autoFocus style={{ textAlign: 'right', fontSize: 20, fontWeight: 700 }} />
      </div>
    </Modal>
  );
};

/* ─── Receipt Modal ───────────────────────────────────────────────── */
const ReceiptModal: React.FC<{ open: boolean; onClose: () => void; sale: any }> = ({ open, onClose, sale }) => {
  if (!sale) return null;
  return (
    <Modal open={open} onClose={onClose} title="Receipt" size="sm"
      footer={<><button className="btn btn-ghost" onClick={() => window.print()}>🖨️ Print</button><button className="btn btn-primary" onClick={onClose}>New Sale</button></>}>
      <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>🍬 SweetPOS</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Invoice: {sale.invoiceNumber}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(sale.createdAt).toLocaleString()}</div>
        </div>
        <div style={{ borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', padding: '8px 0', margin: '8px 0' }}>
          {sale.items?.map((item: any) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.productName} x{item.quantity}</span>
              <span>LKR {fmt(item.totalPrice)}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>LKR {fmt(sale.subtotal)}</span></div>
        {sale.discountAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}><span>Discount</span><span>-LKR {fmt(sale.discountAmount)}</span></div>}
        {sale.taxAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax</span><span>LKR {fmt(sale.taxAmount)}</span></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, borderTop: '1px solid var(--border-color)', marginTop: 8, paddingTop: 8 }}><span>TOTAL</span><span>LKR {fmt(sale.totalAmount)}</span></div>
        {sale.cashReceived && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}><span>Cash</span><span>LKR {fmt(sale.cashReceived)}</span></div>}
        {sale.changeAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}><span>Change</span><span>LKR {fmt(sale.changeAmount)}</span></div>}
        <div style={{ textAlign: 'center', marginTop: 16, color: 'var(--text-muted)', fontSize: 12 }}>Thank you for shopping! 🍬</div>
      </div>
    </Modal>
  );
};

/* ─── Main POS Page ─────────────────────────────────────────────── */
export const POSPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: productsData, isLoading: loadingProducts } = useProducts(selectedCategory, searchTerm);
  const products = productsData?.data ?? [];
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const createSale = useCreateSale();

  const { items, subtotal, discountAmount, taxAmount, totalAmount, discountType, discountValue, paymentMethod, addItem, removeItem, updateQuantity, clearCart, setPaymentMethod, setDiscount, setCustomer } = useCartStore();
  const { user } = useAuthStore();

  // Barcode scanner
  const barcodeBuffer = useRef('');
  const barcodeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBarcodeInput = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
    // Ignore if any modal is open
    if (showPayment || showCustomer || showDiscount || showReceipt) return;

    if (e.key === 'Enter' && barcodeBuffer.current.length > 2) {
      const barcode = barcodeBuffer.current; barcodeBuffer.current = '';
      // First check loaded products, then try API lookup
      const product = products.find(p => p.barcode === barcode);
      if (product && product.stockQuantity > 0) {
        addItem({ productId: product.id, productName: product.name, barcode: product.barcode, unitPrice: product.sellingPrice, costPrice: product.costPrice, taxRate: product.taxRate });
        toast.success(`Added: ${product.name}`);
      } else if (!product) {
        // API lookup for barcode not in current view
        fetch(`/api/products/barcode/${barcode}`, { headers: { Authorization: `Bearer ${localStorage.getItem('sweetpos-access-token')}` } })
          .then(r => r.ok ? r.json() : null)
          .then(p => {
            if (p && p.stockQuantity > 0) {
              addItem({ productId: p.id, productName: p.name, barcode: p.barcode, unitPrice: p.sellingPrice, costPrice: p.costPrice, taxRate: p.taxRate });
              toast.success(`Added: ${p.name}`);
            } else {
              toast.error(p ? 'Product out of stock' : 'Product not found');
            }
          })
          .catch(() => toast.error('Barcode lookup failed'));
      } else {
        toast.error('Product out of stock');
      }
      return;
    }
    if (e.key.length === 1) {
      barcodeBuffer.current += e.key;
      if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);
      barcodeTimeout.current = setTimeout(() => { barcodeBuffer.current = ''; }, 150);
    }
  }, [addItem, products, showPayment, showCustomer, showDiscount, showReceipt]);

  useEffect(() => { window.addEventListener('keydown', handleBarcodeInput); return () => window.removeEventListener('keydown', handleBarcodeInput); }, [handleBarcodeInput]);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'F5') { e.preventDefault(); clearCart(); setSelectedCustomer(null); }
      if (e.key === 'F12') { e.preventDefault(); if (items.length > 0) setShowPayment(true); }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [items, clearCart]);

  const handleProductClick = (product: any) => {
    if (product.stockQuantity <= 0) { toast.error('Out of stock'); return; }
    addItem({ productId: product.id, productName: product.name, barcode: product.barcode, unitPrice: product.sellingPrice, costPrice: product.costPrice, taxRate: product.taxRate });
  };

  const handleSelectCustomer = (c: any | null) => {
    setSelectedCustomer(c);
    setCustomer(c?.id || null);
    if (c) toast.success(`Customer: ${c.name} (${c.loyaltyPoints} pts)`);
  };

  const handleConfirmPayment = async (cashReceived?: number) => {
    try {
      const sale = await createSale.mutateAsync({
        customerId: selectedCustomer?.id || undefined,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, discountAmount: i.discountAmount })),
        discountType: discountType || undefined,
        discountValue: discountValue,
        discountAmount,
        paymentMethod,
        cashReceived,
      });
      setLastSale(sale);
      setShowPayment(false);
      setShowReceipt(true);
      clearCart();
      setSelectedCustomer(null);
      toast.success(`Sale completed! Invoice: ${sale.invoiceNumber}`);
    } catch (err: any) {
      toast.error(err.message || 'Sale failed');
    }
  };

  const getStockClass = (qty: number) => qty <= 0 ? 'out' : qty <= 5 ? 'low' : '';

  return (
    <div className="pos-layout">
      {/* ── Left: Products ── */}
      <div className="pos-products">
        <div style={{ display: 'flex', gap: 8 }}>
          <input ref={searchRef} className="input input-lg input-search" type="text" placeholder="Search products or scan barcode… (F2)" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-ghost btn-lg" onClick={() => setShowScanner(true)} title="Scan with camera" style={{ fontSize: 20, padding: '0 16px', border: '1px solid var(--border-color)' }}>📷</button>
        </div>

        <div className="product-categories">
          <button className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => setSelectedCategory('all')}>All</button>
          {!loadingCategories && categories.map((cat: any) => (
            <button key={cat.id} className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`} onClick={() => setSelectedCategory(cat.id)}
              style={selectedCategory === cat.id ? { background: cat.color || 'var(--color-primary)', borderColor: cat.color || 'var(--color-primary)', color: 'white' } : {}}>
              {cat.icon && <span>{cat.icon} </span>}{cat.name}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {loadingProducts ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading products…</div>
            : products.length === 0 ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No products found</div>
            : products.map((p: any) => (
              <div key={p.id} className="product-card" onClick={() => handleProductClick(p)} style={{ opacity: p.stockQuantity <= 0 ? 0.5 : 1, cursor: p.stockQuantity <= 0 ? 'not-allowed' : 'pointer' }}>
                <span className={`product-card-stock ${getStockClass(p.stockQuantity)}`}>{p.stockQuantity <= 0 ? 'OUT' : Number(p.stockQuantity).toFixed(0)}</span>
                <span className="product-card-emoji">{p.imageUrl || '🍬'}</span>
                <span className="product-card-name">{p.name}</span>
                <span className="product-card-price">LKR {fmt(p.sellingPrice)}</span>
              </div>
            ))}
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 16 }}>
          <span>F2: Search</span><span>F5: Clear</span><span>F12: Pay</span><span>Barcode: Auto-add</span>
        </div>
      </div>

      {/* ── Right: Cart ── */}
      <div className="pos-cart">
        <div className="pos-cart-header">
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 16 }}>Cart ({items.length})</h2>
            {selectedCustomer
              ? <button className="btn btn-ghost" style={{ fontSize: 12, padding: '2px 8px', marginTop: 2 }} onClick={() => setShowCustomer(true)}>👤 {selectedCustomer.name}</button>
              : <button className="btn btn-ghost" style={{ fontSize: 12, padding: '2px 8px', marginTop: 2 }} onClick={() => setShowCustomer(true)}>+ Add Customer</button>}
          </div>
          {items.length > 0 && <button className="btn btn-ghost" style={{ color: 'var(--color-danger)', fontSize: 13 }} onClick={() => { clearCart(); setSelectedCustomer(null); }}>🗑 Clear</button>}
        </div>

        <div className="pos-cart-items">
          {items.length === 0
            ? <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)' }}>
                <span style={{ fontSize: 48 }}>🛒</span>
                <p style={{ fontWeight: 600 }}>Cart is empty</p>
                <p style={{ fontSize: 12 }}>Click a product or scan barcode</p>
              </div>
            : items.map(item => (
              <div key={item.productId} className="pos-cart-item animate-fade-in">
                <div className="pos-cart-item-info">
                  <div className="pos-cart-item-name">{item.productName}</div>
                  <div className="pos-cart-item-price">LKR {fmt(item.unitPrice)}</div>
                </div>
                <div className="pos-cart-quantity">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                </div>
                <div className="pos-cart-item-total">LKR {fmt(item.totalPrice)}</div>
                <button onClick={() => removeItem(item.productId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', fontSize: 16, padding: 4 }}>✕</button>
              </div>
            ))}
        </div>

        <div className="pos-cart-summary">
          <div className="pos-cart-summary-row"><span>Subtotal</span><span>LKR {fmt(subtotal)}</span></div>
          {discountAmount > 0 && <div className="pos-cart-summary-row" style={{ color: 'var(--color-success)' }}><span>Discount ({discountType === DiscountType.PERCENTAGE ? `${discountValue}%` : 'fixed'})</span><span>−LKR {fmt(discountAmount)}</span></div>}
          {taxAmount > 0 && <div className="pos-cart-summary-row"><span>Tax</span><span>+LKR {fmt(taxAmount)}</span></div>}
          <div className="pos-cart-summary-row total"><span>TOTAL</span><span>LKR {fmt(totalAmount)}</span></div>
        </div>

        <div className="pos-cart-actions">
          <div className="pos-payment-methods">
            {([PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.QR] as PaymentMethod[]).map(m => (
              <button key={m} className={`btn ${paymentMethod === m ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPaymentMethod(m)} style={{ textTransform: 'capitalize' }}>
                {m === PaymentMethod.CASH ? '💵' : m === PaymentMethod.CARD ? '💳' : '📱'} {m}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ flex: 1, fontSize: 13 }} onClick={() => setShowDiscount(true)} disabled={items.length === 0}>
              🏷 Discount
            </button>
            <button className="btn btn-ghost" style={{ flex: 1, fontSize: 13 }} onClick={() => { clearCart(); setSelectedCustomer(null); }} disabled={items.length === 0}>
              ❌ Cancel
            </button>
          </div>

          <button className="pos-pay-btn" onClick={() => setShowPayment(true)} disabled={items.length === 0} style={{ opacity: items.length === 0 ? 0.5 : 1 }}>
            🖨 Pay & Print — LKR {fmt(totalAmount)} (F12)
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      <PaymentModal open={showPayment} onClose={() => setShowPayment(false)} total={totalAmount} paymentMethod={paymentMethod} onConfirm={handleConfirmPayment} loading={createSale.isPending} />
      <CustomerModal open={showCustomer} onClose={() => setShowCustomer(false)} onSelect={handleSelectCustomer} selectedId={selectedCustomer?.id ?? null} />
      <DiscountModal open={showDiscount} onClose={() => setShowDiscount(false)} onApply={(t, v) => setDiscount(t, v)} current={{ type: discountType, value: discountValue }} />
      <ReceiptModal open={showReceipt} onClose={() => setShowReceipt(false)} sale={lastSale} />
      <BarcodeScanner open={showScanner} onClose={() => setShowScanner(false)} onScan={(barcode) => {
        // Look up barcode and add to cart
        const product = products.find(p => p.barcode === barcode);
        if (product && product.stockQuantity > 0) {
          addItem({ productId: product.id, productName: product.name, barcode: product.barcode, unitPrice: product.sellingPrice, costPrice: product.costPrice, taxRate: product.taxRate });
          toast.success(`Added: ${product.name}`);
        } else if (!product) {
          fetch(`/api/products/barcode/${barcode}`, { headers: { Authorization: `Bearer ${localStorage.getItem('sweetpos-access-token')}` } })
            .then(r => r.ok ? r.json() : null)
            .then(p => {
              if (p && p.stockQuantity > 0) {
                addItem({ productId: p.id, productName: p.name, barcode: p.barcode, unitPrice: p.sellingPrice, costPrice: p.costPrice, taxRate: p.taxRate });
                toast.success(`Added: ${p.name}`);
              } else {
                toast.error(p ? 'Out of stock' : 'Product not found');
              }
            })
            .catch(() => toast.error('Barcode lookup failed'));
        } else {
          toast.error('Out of stock');
        }
      }} />
    </div>
  );
};
