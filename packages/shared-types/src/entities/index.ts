// ===================================
// SweetPOS Entity Interfaces
// ===================================

import {
  UserRole,
  ProductUnitType,
  PaymentMethod,
  SaleStatus,
  DiscountType,
  MovementType,
  ReturnType,
  PurchaseOrderStatus,
  LoyaltyTransactionType,
  SyncOperation,
  AuditAction,
} from '../enums';

// Base entity with common fields
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// ---- Users ----
export interface User extends BaseEntity {
  username: string;
  email?: string | null;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string | null;
  loginAttempts: number;
  lockedUntil?: string | null;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

// ---- Categories ----
export interface Category extends BaseEntity {
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
}

// ---- Products ----
export interface Product extends BaseEntity {
  barcode?: string | null;
  sku?: string | null;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  sellingPrice: number;
  costPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  unitType: ProductUnitType;
  imageUrl?: string | null;
  taxRate: number;
  isActive: boolean;
  // Populated
  category?: Category | null;
}

// ---- Suppliers ----
export interface Supplier extends BaseEntity {
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive: boolean;
}

// ---- Customers ----
export interface Customer extends BaseEntity {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  loyaltyPoints: number;
  totalSpent: number;
  visitCount: number;
  lastVisit?: string | null;
}

// ---- Sales ----
export interface Sale extends BaseEntity {
  invoiceNumber: string;
  terminalId: string;
  cashierId: string;
  customerId?: string | null;
  subtotal: number;
  discountAmount: number;
  discountType?: DiscountType | null;
  discountValue: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number | null;
  changeAmount?: number | null;
  loyaltyEarned: number;
  loyaltyRedeemed: number;
  status: SaleStatus;
  notes?: string | null;
  syncedAt?: string | null;
  // Populated
  items?: SaleItem[];
  cashier?: User;
  customer?: Customer | null;
  payments?: SalePayment[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  productBarcode?: string | null;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discountAmount: number;
  taxAmount: number;
  totalPrice: number;
  createdAt: string;
}

export interface SalePayment {
  id: string;
  saleId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  reference?: string | null;
  createdAt: string;
}

// ---- Held Sales ----
export interface HeldSale {
  id: string;
  terminalId: string;
  cashierId: string;
  customerId?: string | null;
  cartData: CartState;
  note?: string | null;
  createdAt: string;
}

// ---- Returns ----
export interface Return extends BaseEntity {
  returnNumber: string;
  originalSaleId: string;
  cashierId: string;
  returnType: ReturnType;
  refundAmount: number;
  refundMethod: string;
  reason?: string | null;
  syncedAt?: string | null;
  // Populated
  items?: ReturnItem[];
  originalSale?: Sale;
}

export interface ReturnItem {
  id: string;
  returnId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  restock: boolean;
}

// ---- Inventory ----
export interface InventoryMovement {
  id: string;
  productId: string;
  movementType: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost?: number | null;
  referenceId?: string | null;
  referenceType?: string | null;
  supplierId?: string | null;
  notes?: string | null;
  createdBy: string;
  createdAt: string;
  syncedAt?: string | null;
  // Populated
  product?: Product;
  supplier?: Supplier;
  user?: User;
}

// ---- Purchase Orders ----
export interface PurchaseOrder extends BaseEntity {
  poNumber: string;
  supplierId: string;
  totalAmount: number;
  status: PurchaseOrderStatus;
  notes?: string | null;
  receivedAt?: string | null;
  createdBy: string;
  // Populated
  items?: PurchaseOrderItem[];
  supplier?: Supplier;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
}

// ---- Loyalty ----
export interface LoyaltyConfig {
  id: string;
  pointsPerUnit: number;
  redemptionRate: number;
  minRedemption: number;
  isActive: boolean;
  updatedAt: string;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  saleId?: string | null;
  transactionType: LoyaltyTransactionType;
  points: number;
  balanceAfter: number;
  notes?: string | null;
  createdAt: string;
}

// ---- Discounts ----
export interface Discount {
  id: string;
  name: string;
  discountType: DiscountType;
  value: number;
  minPurchase: number;
  applicableTo: string;
  targetId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  createdAt: string;
}

// ---- Tax ----
export interface TaxConfig {
  id: string;
  name: string;
  rate: number;
  isInclusive: boolean;
  appliesTo: string;
  isActive: boolean;
  createdAt: string;
}

// ---- Audit ----
export interface AuditLog {
  id: string;
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string | null;
  terminalId?: string | null;
  createdAt: string;
  // Populated
  user?: User;
}

// ---- System Config ----
export interface SystemConfig {
  key: string;
  value: string;
  category: string;
  description?: string | null;
  updatedAt: string;
}

// ---- Sync ----
export interface SyncOutboxEntry {
  id: number;
  entityType: string;
  entityId: string;
  operation: SyncOperation;
  payload: string;
  localVersion: number;
  retryCount: number;
  lastError?: string | null;
  createdAt: string;
  syncedAt?: string | null;
}

export interface SyncState {
  key: string;
  value: string;
}

// ---- Cart State (used in UI and held sales) ----
export interface CartItem {
  productId: string;
  productName: string;
  barcode?: string | null;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  discountAmount: number;
  taxAmount: number;
  totalPrice: number;
  taxRate: number;
}

export interface CartState {
  items: CartItem[];
  customerId?: string | null;
  discountType?: DiscountType | null;
  discountValue: number;
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
}

// ---- Dashboard ----
export interface AdminDashboard {
  todaySales: number;
  todayTransactions: number;
  monthlySales: number;
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  topProducts: Array<{ productName: string; quantity: number; revenue: number }>;
  revenueTrend: Array<{ date: string; revenue: number }>;
  profitTrend: Array<{ date: string; profit: number }>;
}

export interface CashierDashboard {
  todaySales: number;
  todayTransactions: number;
  todayReturns: number;
  averageTransactionValue: number;
}
