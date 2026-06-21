export interface ElectronAPI {
  getVersion: () => Promise<string>;
  getTerminalId: () => Promise<string>;
  
  dbQuery: <T = any>(sql: string, params?: unknown[]) => Promise<T[]>;
  dbMutate: (sql: string, params?: unknown[]) => Promise<{ changes: number; lastInsertRowid: number | string }>;
  
  printReceipt: (data: unknown) => Promise<{ success: boolean; message: string }>;
  getPrinters: () => Promise<any[]>;
  
  getSyncStatus: () => Promise<string>;
  forceSync: () => Promise<void>;
  
  onSyncStatusChange: (callback: (status: string) => void) => void;

  authLogin: (username: string, password: string) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
