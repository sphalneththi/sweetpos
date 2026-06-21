import { create } from 'zustand';
import { CartItem, DiscountType, PaymentMethod } from '@sweetpos/shared-types';

interface CartState {
  items: CartItem[];
  customerId: string | null;
  discountType: DiscountType | null;
  discountValue: number;
  paymentMethod: PaymentMethod;

  // Computed
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;

  // Actions
  addItem: (product: {
    productId: string;
    productName: string;
    barcode?: string | null;
    unitPrice: number;
    costPrice: number;
    taxRate: number;
  }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDiscount: (type: DiscountType | null, value: number) => void;
  setCustomer: (customerId: string | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  clearCart: () => void;
  recalculate: () => void;
}

const calculateTotals = (
  items: CartItem[],
  discountType: DiscountType | null,
  discountValue: number,
) => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  let discountAmount = 0;
  if (discountType === DiscountType.PERCENTAGE) {
    discountAmount = subtotal * (discountValue / 100);
  } else if (discountType === DiscountType.FIXED) {
    discountAmount = Math.min(discountValue, subtotal);
  }

  const taxableAmount = subtotal - discountAmount;
  const taxAmount = items.reduce((sum, item) => {
    const itemRatio = item.totalPrice / (subtotal || 1);
    return sum + taxableAmount * itemRatio * (item.taxRate / 100);
  }, 0);

  const totalAmount = subtotal - discountAmount + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerId: null,
  discountType: null,
  discountValue: 0,
  paymentMethod: PaymentMethod.CASH,
  subtotal: 0,
  discountAmount: 0,
  taxAmount: 0,
  totalAmount: 0,

  addItem: (product) => {
    const state = get();
    const existingIndex = state.items.findIndex((i) => i.productId === product.productId);

    let newItems: CartItem[];
    if (existingIndex >= 0) {
      newItems = [...state.items];
      const existing = newItems[existingIndex];
      const newQty = existing.quantity + 1;
      newItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        totalPrice: newQty * existing.unitPrice - existing.discountAmount,
        taxAmount: newQty * existing.unitPrice * (existing.taxRate / 100),
      };
    } else {
      const newItem: CartItem = {
        productId: product.productId,
        productName: product.productName,
        barcode: product.barcode,
        unitPrice: product.unitPrice,
        costPrice: product.costPrice,
        quantity: 1,
        discountAmount: 0,
        taxAmount: product.unitPrice * (product.taxRate / 100),
        totalPrice: product.unitPrice,
        taxRate: product.taxRate,
      };
      newItems = [...state.items, newItem];
    }

    const totals = calculateTotals(newItems, state.discountType, state.discountValue);
    set({ items: newItems, ...totals });
  },

  removeItem: (productId) => {
    const state = get();
    const newItems = state.items.filter((i) => i.productId !== productId);
    const totals = calculateTotals(newItems, state.discountType, state.discountValue);
    set({ items: newItems, ...totals });
  },

  updateQuantity: (productId, quantity) => {
    const state = get();
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const newItems = state.items.map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity,
            totalPrice: quantity * item.unitPrice - item.discountAmount,
            taxAmount: quantity * item.unitPrice * (item.taxRate / 100),
          }
        : item,
    );
    const totals = calculateTotals(newItems, state.discountType, state.discountValue);
    set({ items: newItems, ...totals });
  },

  setDiscount: (type, value) => {
    const state = get();
    const totals = calculateTotals(state.items, type, value);
    set({ discountType: type, discountValue: value, ...totals });
  },

  setCustomer: (customerId) => set({ customerId }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  clearCart: () =>
    set({
      items: [],
      customerId: null,
      discountType: null,
      discountValue: 0,
      paymentMethod: PaymentMethod.CASH,
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
    }),

  recalculate: () => {
    const state = get();
    const totals = calculateTotals(state.items, state.discountType, state.discountValue);
    set(totals);
  },
}));
