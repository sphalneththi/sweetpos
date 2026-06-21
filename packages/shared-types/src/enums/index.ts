// ===================================
// SweetPOS Enums
// ===================================

export enum UserRole {
  ADMIN = 'admin',
  CASHIER = 'cashier',
}

export enum ProductUnitType {
  PIECE = 'piece',
  KG = 'kg',
  G = 'g',
  L = 'l',
  ML = 'ml',
  PACK = 'pack',
  BOX = 'box',
  DOZEN = 'dozen',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  QR = 'qr',
  MOBILE_WALLET = 'mobile_wallet',
  BANK_TRANSFER = 'bank_transfer',
  SPLIT = 'split',
}

export enum SaleStatus {
  COMPLETED = 'completed',
  HELD = 'held',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum MovementType {
  STOCK_IN = 'stock_in',
  STOCK_OUT = 'stock_out',
  ADJUSTMENT = 'adjustment',
  DAMAGED = 'damaged',
  SALE = 'sale',
  RETURN = 'return',
  TRANSFER = 'transfer',
}

export enum ReturnType {
  FULL = 'full',
  PARTIAL = 'partial',
  EXCHANGE = 'exchange',
}

export enum PurchaseOrderStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled',
}

export enum LoyaltyTransactionType {
  EARN = 'earn',
  REDEEM = 'redeem',
  ADJUST = 'adjust',
  EXPIRE = 'expire',
}

export enum SyncOperation {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  STOCK_IN = 'stock_in',
  STOCK_OUT = 'stock_out',
  STOCK_ADJUST = 'stock_adjust',
  SALE = 'sale',
  REFUND = 'refund',
  PRICE_CHANGE = 'price_change',
  PASSWORD_CHANGE = 'password_change',
}
