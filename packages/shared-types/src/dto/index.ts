// ===================================
// SweetPOS DTO Interfaces
// ===================================

import { UserRole, ProductUnitType, PaymentMethod, DiscountType, MovementType, ReturnType } from '../enums/index';
import { CartItem } from '../entities/index';

// ---- Auth ----
export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    role: UserRole;
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// ---- Users ----
export interface CreateUserDto {
  username: string;
  email?: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  role?: UserRole;
  isActive?: boolean;
}

// ---- Products ----
export interface CreateProductDto {
  barcode?: string;
  sku?: string;
  name: string;
  description?: string;
  categoryId?: string;
  sellingPrice: number;
  costPrice: number;
  stockQuantity?: number;
  minStockLevel?: number;
  unitType?: ProductUnitType;
  imageUrl?: string;
  taxRate?: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  isActive?: boolean;
}

// ---- Categories ----
export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  isActive?: boolean;
}

// ---- Sales ----
export interface CreateSaleDto {
  customerId?: string;
  items: CreateSaleItemDto[];
  discountType?: DiscountType;
  discountValue?: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  loyaltyRedeemed?: number;
  notes?: string;
  payments?: CreateSalePaymentDto[];
}

export interface CreateSaleItemDto {
  productId: string;
  quantity: number;
  discountAmount?: number;
}

export interface CreateSalePaymentDto {
  paymentMethod: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface HoldSaleDto {
  customerId?: string;
  cartData: {
    items: CartItem[];
    discountType?: DiscountType;
    discountValue: number;
  };
  note?: string;
}

// ---- Returns ----
export interface CreateReturnDto {
  originalSaleId: string;
  returnType: ReturnType;
  refundMethod: string;
  reason?: string;
  items: CreateReturnItemDto[];
}

export interface CreateReturnItemDto {
  productId: string;
  quantity: number;
  restock?: boolean;
}

// ---- Inventory ----
export interface StockMovementDto {
  productId: string;
  movementType: MovementType;
  quantity: number;
  unitCost?: number;
  supplierId?: string;
  notes?: string;
}

// ---- Suppliers ----
export interface CreateSupplierDto {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {
  isActive?: boolean;
}

// ---- Customers ----
export interface CreateCustomerDto {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

// ---- Loyalty ----
export interface UpdateLoyaltyConfigDto {
  pointsPerUnit?: number;
  redemptionRate?: number;
  minRedemption?: number;
  isActive?: boolean;
}

export interface RedeemLoyaltyDto {
  customerId: string;
  points: number;
  saleId?: string;
}

// ---- Reports ----
export interface ReportQueryDto {
  from?: string;
  to?: string;
  groupBy?: 'day' | 'week' | 'month' | 'year';
  categoryId?: string;
  cashierId?: string;
  limit?: number;
}

export interface ExportReportDto {
  reportType: string;
  format: 'pdf' | 'excel' | 'csv';
  from?: string;
  to?: string;
  filters?: Record<string, string>;
}

// ---- Sync ----
export interface SyncPushDto {
  terminalId: string;
  entries: SyncPushEntry[];
}

export interface SyncPushEntry {
  entityType: string;
  entityId: string;
  operation: string;
  payload: Record<string, unknown>;
  localVersion: number;
  timestamp: string;
}

export interface SyncPullResponseDto {
  entries: SyncPullEntry[];
  currentVersion: number;
  hasMore: boolean;
}

export interface SyncPullEntry {
  entityType: string;
  entityId: string;
  operation: string;
  payload: Record<string, unknown>;
  version: number;
  timestamp: string;
}

// ---- Pagination ----
export interface PaginatedDto<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ---- System Config ----
export interface UpdateConfigDto {
  configs: Array<{
    key: string;
    value: string;
  }>;
}
