import Database from 'better-sqlite3';
import { join } from 'path';
import { app } from 'electron';
import log from 'electron-log';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseService {
  private db: Database.Database;

  constructor() {
    const userDataPath = app.getPath('userData');
    const dbDir = join(userDataPath, 'database');
    
    // Ensure directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = join(dbDir, 'sweetpos.db');
    log.info(`Initializing local SQLite database at: ${dbPath}`);
    
    this.db = new Database(dbPath, { verbose: (msg) => log.debug(msg) });
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    this.initializeSchema();
  }

  private initializeSchema() {
    // We create the core tables mirroring the PostgreSQL schema
    // Plus an 'outbox' table for offline sync
    
    const schema = `
      -- Users
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        last_login DATETIME,
        login_attempts INTEGER DEFAULT 0,
        locked_until DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
      );

      -- Categories
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        color TEXT,
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
      );

      -- Products
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        barcode TEXT UNIQUE,
        sku TEXT UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        category_id TEXT,
        selling_price REAL NOT NULL,
        cost_price REAL NOT NULL,
        stock_quantity REAL DEFAULT 0,
        min_stock_level REAL DEFAULT 0,
        unit_type TEXT DEFAULT 'piece',
        image_url TEXT,
        tax_rate REAL DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );

      -- Sales
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        invoice_number TEXT UNIQUE NOT NULL,
        terminal_id TEXT NOT NULL,
        cashier_id TEXT NOT NULL,
        customer_id TEXT,
        subtotal REAL NOT NULL,
        discount_amount REAL DEFAULT 0,
        discount_type TEXT,
        discount_value REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        cash_received REAL,
        change_amount REAL,
        loyalty_earned INTEGER DEFAULT 0,
        loyalty_redeemed INTEGER DEFAULT 0,
        status TEXT DEFAULT 'completed',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME
      );

      -- Sale Items
      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        product_barcode TEXT,
        quantity REAL NOT NULL,
        unit_price REAL NOT NULL,
        cost_price REAL NOT NULL,
        discount_amount REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        total_price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
      );

      -- Sync Outbox (stores mutations to be synced to cloud)
      CREATE TABLE IF NOT EXISTS sync_outbox (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL, -- CREATE, UPDATE, DELETE
        payload TEXT NOT NULL, -- JSON
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'PENDING', -- PENDING, FAILED
        error_message TEXT,
        retry_count INTEGER DEFAULT 0
      );
    `;

    try {
      this.db.exec(schema);
      log.info('SQLite schema initialized successfully');
      this.seedInitialData();
    } catch (error) {
      log.error('Failed to initialize SQLite schema:', error);
    }
  }

  private seedInitialData() {
    try {
      // Check if admin user exists
      const stmt = this.db.prepare('SELECT count(*) as count FROM users');
      const row = stmt.get() as { count: number };
      
      if (row.count === 0) {
        log.info('No users found. Seeding initial admin and cashier...');
        
        const insertUser = this.db.prepare(`
          INSERT INTO users (id, username, password_hash, full_name, role)
          VALUES (?, ?, ?, ?, ?)
        `);

        // Need to sync hash because better-sqlite3 is synchronous
        // Note: bcrypt.hashSync is CPU intensive but fine for one-time setup
        const adminHash = bcrypt.hashSync('admin123', 10);
        const cashierHash = bcrypt.hashSync('cashier123', 10);

        insertUser.run(uuidv4(), 'admin', adminHash, 'System Administrator', 'ADMIN');
        insertUser.run(uuidv4(), 'cashier1', cashierHash, 'Main Cashier', 'CASHIER');

        // Seed basic categories
        const insertCategory = this.db.prepare(`
          INSERT INTO categories (id, name, color, sort_order)
          VALUES (?, ?, ?, ?)
        `);

        insertCategory.run('toffee', 'Milk Toffee', '#ff9100', 1);
        insertCategory.run('chocolate', 'Chocolate', '#6c5ce7', 2);
        insertCategory.run('cake', 'Cake', '#e85d75', 3);
        
        log.info('Initial data seeded successfully');
      }
    } catch (error) {
      log.error('Failed to seed initial data:', error);
    }
  }

  public query(sql: string, params: any[] = []): any[] {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(...params);
    } catch (error) {
      log.error('Database query error:', error, sql);
      throw error;
    }
  }

  public mutate(sql: string, params: any[] = []): any {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(...params);
      return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
    } catch (error) {
      log.error('Database mutation error:', error, sql);
      throw error;
    }
  }

  public addToOutbox(entityType: string, entityId: string, operation: 'CREATE' | 'UPDATE' | 'DELETE', payload: any) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO sync_outbox (entity_type, entity_id, operation, payload)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(entityType, entityId, operation, JSON.stringify(payload));
      log.info(`Added to sync outbox: ${operation} ${entityType} ${entityId}`);
    } catch (error) {
      log.error('Failed to add to sync outbox:', error);
    }
  }

  public close() {
    this.db.close();
    log.info('Database connection closed');
  }
}
