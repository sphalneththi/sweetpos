import { contextBridge, ipcRenderer } from 'electron';

// Expose safe API to renderer via contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  // App
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getTerminalId: () => ipcRenderer.invoke('system:get-terminal-id'),

  // Database operations (will be implemented)
  dbQuery: (sql: string, params?: unknown[]) => ipcRenderer.invoke('db:query', sql, params),
  dbMutate: (sql: string, params?: unknown[]) => ipcRenderer.invoke('db:mutate', sql, params),

  // Printer
  printReceipt: (data: unknown) => ipcRenderer.invoke('printer:print-receipt', data),
  getPrinters: () => ipcRenderer.invoke('printer:get-list'),

  // Sync
  getSyncStatus: () => ipcRenderer.invoke('sync:status'),
  forceSync: () => ipcRenderer.invoke('sync:force'),

  // Listeners
  onSyncStatusChange: (callback: (status: string) => void) => {
    ipcRenderer.on('sync:on-status-change', (_event, status) => callback(status));
  },

  // Auth
  authLogin: (username, password) => ipcRenderer.invoke('auth:login', username, password),
});
