import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import log from 'electron-log';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from './db';
import { PrinterService } from './printer';

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

let mainWindow: BrowserWindow | null = null;
let dbService: DatabaseService | null = null;
let printerService: PrinterService | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'SweetPOS',
    icon: join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
    backgroundColor: '#0d0f14',
  });

  // Show when ready to prevent visual flash
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
    log.info('SweetPOS window ready');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // In development, load from Vite dev server
  if (!app.isPackaged) {
    // Fallback to localhost:5174 if port 5173 is busy
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL || 'http://localhost:5174');
  } else {
    // In production, load from built files
    mainWindow.loadFile(join(__dirname, '../../renderer/index.html'));
  }

  printerService = new PrinterService(mainWindow);
}

app.whenReady().then(() => {
  // Initialize local database
  dbService = new DatabaseService();

  createWindow();
  log.info('🍬 SweetPOS Desktop started');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});

ipcMain.handle('system:get-terminal-id', () => {
  // Generate or retrieve stored terminal ID
  return `T-${Date.now().toString(36).toUpperCase()}`;
});

// Database IPC
ipcMain.handle('db:query', (_event, sql: string, params: any[]) => {
  return dbService?.query(sql, params);
});

ipcMain.handle('db:mutate', (_event, sql: string, params: any[]) => {
  return dbService?.mutate(sql, params);
});

// Printer IPC
ipcMain.handle('printer:get-list', async () => {
  return printerService?.getPrinters();
});

ipcMain.handle('printer:print-receipt', async (_event, data: any) => {
  return printerService?.printReceipt(data);
});

// Auth IPC
ipcMain.handle('auth:login', async (_event, username: string, password: string) => {
  if (!dbService) throw new Error('Database not initialized');
  const users = dbService.query('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
  if (users.length === 0) {
    throw new Error('Invalid username or password');
  }
  const user = users[0] as any;
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid username or password');
  }
  
  // Return user without password
  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    role: user.role
  };
});
