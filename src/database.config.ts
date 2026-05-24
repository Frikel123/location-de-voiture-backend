import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const getEnv = (...keys: string[]) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value !== undefined && value !== '') return value;
  }

  return undefined;
};

const getRequiredEnv = (...keys: string[]) => {
  const value = getEnv(...keys);
  if (!value) {
    throw new Error(`Missing required database environment variable: ${keys.join(' or ')}`);
  }

  return value;
};

const getDbPort = () => {
  const rawPort = getEnv('DB_PORT', 'MYSQLPORT') || '3306';
  const port = parseInt(rawPort, 10);

  if (Number.isNaN(port)) {
    throw new Error(`Invalid database port: ${rawPort}`);
  }

  return port;
};

const getSynchronize = () => getEnv('DB_SYNCHRONIZE') === 'true';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const host = getRequiredEnv('DB_HOST', 'MYSQLHOST');
  const port = getDbPort();
  const username = getRequiredEnv('DB_USERNAME', 'MYSQLUSER');
  const password = getRequiredEnv('DB_PASSWORD', 'MYSQLPASSWORD');
  const database = getRequiredEnv('DB_NAME', 'MYSQLDATABASE', 'DB_DATABASE');
  const synchronize = getSynchronize();

  console.log('[database] TypeORM MySQL config', {
    host,
    port,
    username,
    database,
    synchronize,
    password: password ? '[set]' : '[missing]',
  });

  return {
    type: 'mysql',
    host,
    port,
    username,
    password,
    database,
    autoLoadEntities: true,
    synchronize,
  };
};
