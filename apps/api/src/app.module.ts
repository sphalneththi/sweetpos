import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SalesModule } from './modules/sales/sales.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { ReportsModule } from './modules/reports/reports.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { SyncModule } from './modules/sync/sync.module';
import { AuditModule } from './modules/audit/audit.module';
import { BackupModule } from './modules/backup/backup.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Environment config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // PostgreSQL database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'sweetpos'),
        password: config.get('DB_PASSWORD', 'sweetpos_dev_password'),
        database: config.get('DB_DATABASE', 'sweetpos'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') === 'development',
        logging: config.get('NODE_ENV') === 'development' ? ['error', 'warn'] : ['error'],
        ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([{
        ttl: config.get('THROTTLE_TTL', 60000),
        limit: config.get('THROTTLE_LIMIT', 100),
      }]),
    }),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    SalesModule,
    InventoryModule,
    CustomersModule,
    SuppliersModule,
    ReportsModule,
    LoyaltyModule,
    SyncModule,
    AuditModule,
    BackupModule,
    DashboardModule,
    HealthModule,
  ],
  providers: [
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
