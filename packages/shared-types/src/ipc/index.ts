// ===================================
// SweetPOS IPC Channel Definitions
// ===================================

// Type-safe IPC channel names used between Electron main and renderer
export const IPC_CHANNELS = {
  // Auth
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_GET_SESSION: 'auth:get-session',

  // Database operations
  DB_QUERY: 'db:query',
  DB_MUTATE: 'db:mutate',

  // Products
  PRODUCTS_GET_ALL: 'products:get-all',
  PRODUCTS_GET_BY_ID: 'products:get-by-id',
  PRODUCTS_GET_BY_BARCODE: 'products:get-by-barcode',
  PRODUCTS_SEARCH: 'products:search',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',

  // Categories
  CATEGORIES_GET_ALL: 'categories:get-all',
  CATEGORIES_CREATE: 'categories:create',
  CATEGORIES_UPDATE: 'categories:update',
  CATEGORIES_DELETE: 'categories:delete',

  // Sales
  SALES_CREATE: 'sales:create',
  SALES_GET_ALL: 'sales:get-all',
  SALES_GET_BY_ID: 'sales:get-by-id',
  SALES_GET_MY: 'sales:get-my',
  SALES_CANCEL: 'sales:cancel',
  SALES_HOLD: 'sales:hold',
  SALES_GET_HELD: 'sales:get-held',
  SALES_RESUME: 'sales:resume',
  SALES_DELETE_HELD: 'sales:delete-held',

  // Returns
  RETURNS_CREATE: 'returns:create',
  RETURNS_GET_ALL: 'returns:get-all',

  // Inventory
  INVENTORY_GET_STOCK: 'inventory:get-stock',
  INVENTORY_MOVEMENT: 'inventory:movement',
  INVENTORY_LOW_STOCK: 'inventory:low-stock',
  INVENTORY_MOVEMENTS_HISTORY: 'inventory:movements-history',

  // Customers
  CUSTOMERS_GET_ALL: 'customers:get-all',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_UPDATE: 'customers:update',
  CUSTOMERS_SEARCH: 'customers:search',

  // Suppliers
  SUPPLIERS_GET_ALL: 'suppliers:get-all',
  SUPPLIERS_CREATE: 'suppliers:create',
  SUPPLIERS_UPDATE: 'suppliers:update',

  // Reports
  REPORTS_SALES: 'reports:sales',
  REPORTS_PRODUCTS: 'reports:products',
  REPORTS_INVENTORY: 'reports:inventory',
  REPORTS_FINANCIAL: 'reports:financial',
  REPORTS_CASHIER: 'reports:cashier',
  REPORTS_EXPORT: 'reports:export',

  // Dashboard
  DASHBOARD_ADMIN: 'dashboard:admin',
  DASHBOARD_CASHIER: 'dashboard:cashier',

  // Printer
  PRINTER_PRINT_RECEIPT: 'printer:print-receipt',
  PRINTER_PRINT_BARCODE: 'printer:print-barcode',
  PRINTER_GET_LIST: 'printer:get-list',
  PRINTER_OPEN_DRAWER: 'printer:open-drawer',

  // Sync
  SYNC_STATUS: 'sync:status',
  SYNC_FORCE: 'sync:force',
  SYNC_ON_STATUS_CHANGE: 'sync:on-status-change',

  // System
  SYSTEM_GET_CONFIG: 'system:get-config',
  SYSTEM_UPDATE_CONFIG: 'system:update-config',
  SYSTEM_GET_TERMINAL_ID: 'system:get-terminal-id',

  // Backup
  BACKUP_CREATE: 'backup:create',
  BACKUP_LIST: 'backup:list',
  BACKUP_RESTORE: 'backup:restore',

  // Audit
  AUDIT_GET_LOGS: 'audit:get-logs',

  // App
  APP_GET_VERSION: 'app:get-version',
  APP_CHECK_UPDATE: 'app:check-update',
  APP_QUIT: 'app:quit',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
