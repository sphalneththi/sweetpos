import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCartStore } from '../../stores/cart.store';
import { useAuthStore } from '../../stores/auth.store';
import { PaymentMethod } from '@sweetpos/shared-types';

import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};

export const POSPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading: loadingProducts } = useProducts(selectedCategory, searchTerm);
  const { data: categories = [], isLoading: loadingCategories } = useCategories();

  const { items, subtotal, discountAmount, taxAmount, totalAmount, addItem, removeItem, updateQuantity, clearCart, setPaymentMethod, paymentMethod } = useCartStore();
  const { user } = useAuthStore();

  // Barcode scanner listener — detects rapid key input
  const barcodeBuffer = useRef('');
  const barcodeTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleBarcodeInput = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in search or modal
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    if (e.key === 'Enter' && barcodeBuffer.current.length > 3) {
      const barcode = barcodeBuffer.current;
      barcodeBuffer.current = '';
      // Find product by barcode
      const product = products.find((p) => p.barcode === barcode);
      if (product && product.stockQuantity > 0) {
        addItem({
          productId: product.id,
          productName: product.name,
          barcode: product.barcode,
          unitPrice: product.sellingPrice,
          costPrice: product.costPrice,
          taxRate: product.taxRate,
        });
      }
      return;
    }

    if (e.key.length === 1) {
      barcodeBuffer.current += e.key;
      if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);
      barcodeTimeout.current = setTimeout(() => {
        barcodeBuffer.current = '';
      }, 100); // Reset if no input within 100ms (scanner is fast)
    }
  }, [addItem]);

  useEffect(() => {
    window.addEventListener('keydown', handleBarcodeInput);
    return () => window.removeEventListener('keydown', handleBarcodeInput);
  }, [handleBarcodeInput]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'F5') { e.preventDefault(); clearCart(); }
      if (e.key === 'F12') { e.preventDefault(); handlePayment(); }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const handleProductClick = (product: any) => {
    if (product.stockQuantity <= 0) return;
    addItem({
      productId: product.id,
      productName: product.name,
      barcode: product.barcode,
      unitPrice: product.sellingPrice,
      costPrice: product.costPrice,
      taxRate: product.taxRate,
    });
  };

  const handlePayment = () => {
    if (items.length === 0) return;
    // TODO: Implement payment modal
    alert(`Sale completed! Total: ${formatCurrency(totalAmount)}`);
    clearCart();
  };

  const getStockClass = (qty: number) => {
    if (qty <= 0) return 'out';
    if (qty <= 10) return 'low';
    return '';
  };

  return (
    <div className="pos-layout">
      {/* Left: Products */}
      <div className="pos-products">
        {/* Search Bar */}
        <input
          ref={searchRef}
          id="pos-search"
          className="input input-lg input-search"
          type="text"
          placeholder="Search products or scan barcode... (F2)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Categories */}
        <div className="product-categories">
          {loadingCategories ? (
            <div className="p-4 text-muted">Loading categories...</div>
          ) : (
            <>
              <button
                className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
                style={selectedCategory === 'all' ? { background: '#e85d75', borderColor: '#e85d75' } : undefined}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={selectedCategory === cat.id ? { background: cat.color || '#6c5ce7', borderColor: cat.color || '#6c5ce7' } : undefined}
                >
                  {cat.name}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {loadingProducts ? (
            <div className="p-8 text-center text-muted" style={{ gridColumn: '1 / -1' }}>Loading products...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-muted" style={{ gridColumn: '1 / -1' }}>No products found</div>
          ) : (
            products.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => handleProductClick(product)}
              style={{
                opacity: product.stockQuantity <= 0 ? 0.5 : 1,
                cursor: product.stockQuantity <= 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <span
                className={`product-card-stock ${getStockClass(product.stockQuantity)}`}
              >
                {product.stockQuantity <= 0 ? 'OUT' : product.stockQuantity}
              </span>
              <span className="product-card-emoji">{product.imageUrl || '🍬'}</span>
              <span className="product-card-name">{product.name}</span>
              <span className="product-card-price">{formatCurrency(product.sellingPrice)}</span>
            </div>
          )))}
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="flex items-center gap-4" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          <span>F2: Search</span>
          <span>F5: Clear Cart</span>
          <span>F12: Pay</span>
          <span>Scan: Auto-add</span>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="pos-cart">
        <div className="pos-cart-header">
          <div>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Shopping Cart</h2>
            <span className="text-sm text-muted">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>
          {items.length > 0 && (
            <button className="btn btn-ghost" onClick={clearCart} id="clear-cart-btn">
              🗑️ Clear
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="pos-cart-items">
          {items.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 'var(--space-4)',
                color: 'var(--text-muted)',
              }}
            >
              <span style={{ fontSize: '3rem' }}>🛒</span>
              <p>Cart is empty</p>
              <p style={{ fontSize: 'var(--font-size-xs)' }}>
                Click a product or scan a barcode to add items
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="pos-cart-item animate-fade-in">
                <div className="pos-cart-item-info">
                  <div className="pos-cart-item-name">{item.productName}</div>
                  <div className="pos-cart-item-price">
                    {formatCurrency(item.unitPrice)} each
                  </div>
                </div>
                <div className="pos-cart-quantity">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                    +
                  </button>
                </div>
                <div className="pos-cart-item-total">{formatCurrency(item.totalPrice)}</div>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => removeItem(item.productId)}
                  style={{ width: 28, height: 28, fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)' }}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="pos-cart-summary">
          <div className="pos-cart-summary-row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="pos-cart-summary-row" style={{ color: 'var(--color-success)' }}>
              <span>Discount</span>
              <span>−{formatCurrency(discountAmount)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="pos-cart-summary-row">
              <span>Tax</span>
              <span>+{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="pos-cart-summary-row total">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pos-cart-actions">
          {/* Payment Methods */}
          <div className="pos-payment-methods">
            {[
              { method: PaymentMethod.CASH, label: '💵 Cash', id: 'pay-cash' },
              { method: PaymentMethod.CARD, label: '💳 Card', id: 'pay-card' },
              { method: PaymentMethod.QR, label: '📱 QR', id: 'pay-qr' },
            ].map(({ method, label, id }) => (
              <button
                key={method}
                id={id}
                className={`btn ${paymentMethod === method ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPaymentMethod(method)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button className="btn btn-ghost" style={{ flex: 1 }} id="hold-sale-btn">
              ⏸️ Hold
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} id="cancel-sale-btn" onClick={clearCart}>
              ❌ Cancel
            </button>
          </div>

          {/* Pay Button */}
          <button
            className="pos-pay-btn"
            onClick={handlePayment}
            disabled={items.length === 0}
            id="pay-and-print-btn"
            style={{ opacity: items.length === 0 ? 0.5 : 1 }}
          >
            🖨️ Pay & Print — {formatCurrency(totalAmount)} (F12)
          </button>
        </div>
      </div>
    </div>
  );
};
