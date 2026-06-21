import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'sweetpos',
  password: process.env.DB_PASSWORD || 'sweetpos123',
  database: process.env.DB_DATABASE || 'sweetpos',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
