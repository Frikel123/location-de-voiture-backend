import { TypeOrmModuleOptions } from '@nestjs/typeorm';

type DatabaseConnectionConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

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

const parseDatabaseUrl = (): DatabaseConnectionConfig | undefined => {
  const databaseUrl = getEnv('DATABASE_URL', 'DB_URL', 'MYSQL_PUBLIC_URL', 'MYSQL_URL');
  if (!databaseUrl) return undefined;

  try {
    const url = new URL(databaseUrl);
    if (!['mysql:', 'mysql2:'].includes(url.protocol)) {
      throw new Error(`Unsupported database URL protocol: ${url.protocol}`);
    }

    return {
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : 3306,
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.replace(/^\//, '')),
    };
  } catch (error) {
    throw new Error(`Invalid MySQL database URL: ${(error as Error).message}`);
  }
};

const getConnectionConfig = (): DatabaseConnectionConfig => {
  const urlConfig = parseDatabaseUrl();

  return {
    host: getEnv('DB_HOST', 'MYSQLHOST') || urlConfig?.host || getRequiredEnv('DB_HOST', 'MYSQLHOST'),
    port: getEnv('DB_PORT', 'MYSQLPORT') ? getDbPort() : urlConfig?.port || getDbPort(),
    username:
      getEnv('DB_USERNAME', 'MYSQLUSER') ||
      urlConfig?.username ||
      getRequiredEnv('DB_USERNAME', 'MYSQLUSER'),
    password:
      getEnv('DB_PASSWORD', 'MYSQLPASSWORD') ||
      urlConfig?.password ||
      getRequiredEnv('DB_PASSWORD', 'MYSQLPASSWORD'),
    database:
      getEnv('DB_NAME', 'MYSQLDATABASE', 'DB_DATABASE') ||
      urlConfig?.database ||
      getRequiredEnv('DB_NAME', 'MYSQLDATABASE', 'DB_DATABASE'),
  };
};

const assertReachableHost = (host: string) => {
  const isRailwayInternalHost = host.endsWith('.railway.internal');
  const isRunningOnRailway = Boolean(getEnv('RAILWAY_ENVIRONMENT', 'RAILWAY_PROJECT_ID', 'RAILWAY_SERVICE_ID'));

  if (isRailwayInternalHost && !isRunningOnRailway) {
    throw new Error(
      [
        `Database host "${host}" is a Railway private-network host and cannot be resolved from your local machine.`,
        'For local development, use Railway MySQL public networking values, for example DATABASE_URL/MYSQL_PUBLIC_URL or DB_HOST plus DB_PORT from the public TCP proxy.',
        'Keep mysql.railway.internal only for code running inside Railway.',
      ].join(' '),
    );
  }
};

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const { host, port, username, password, database } = getConnectionConfig();
  const synchronize = getSynchronize();

  assertReachableHost(host);

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
