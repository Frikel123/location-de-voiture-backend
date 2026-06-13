import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Admin } from '../auth/admin.entity';
import { getDatabaseConfig } from '../database.config';

const ADMIN_EMAIL = 'admin@n1luxcars.com';
const ADMIN_PASSWORD = 'n1luxcars';
const BCRYPT_ROUNDS = 10;

const loadLocalEnv = () => {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

const createDataSource = () => {
  const config = {
    ...getDatabaseConfig(),
  } as DataSourceOptions & { autoLoadEntities?: boolean };
  delete config.autoLoadEntities;

  return new DataSource({
    ...config,
    entities: [Admin],
  });
};

const printCredentials = () => {
  console.log('');
  console.log('Administrator credentials');
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log('');
};

const seedAdmin = async () => {
  loadLocalEnv();

  const dataSource = createDataSource();
  await dataSource.initialize();

  try {
    const adminRepository = dataSource.getRepository(Admin);
    const existingAdminCount = await adminRepository.count();

    if (existingAdminCount > 0) {
      const existingSeedAdmin = await adminRepository.findOne({
        where: { email: ADMIN_EMAIL },
      });

      console.log(
        existingSeedAdmin
          ? `Admin "${ADMIN_EMAIL}" already exists. No new admin was created.`
          : 'An administrator already exists. No new admin was created.',
      );
      printCredentials();
      return;
    }

    const existingSeedAdmin = await adminRepository.findOne({
      where: { email: ADMIN_EMAIL },
    });

    if (existingSeedAdmin) {
      console.log(
        `Admin "${ADMIN_EMAIL}" already exists. No new admin was created.`,
      );
      printCredentials();
      return;
    }

    const password = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);
    const admin = adminRepository.create({
      email: ADMIN_EMAIL,
      password,
    });

    await adminRepository.save(admin);

    console.log(`First administrator created with id ${admin.id}.`);
    printCredentials();
  } finally {
    await dataSource.destroy();
  }
};

seedAdmin().catch((error) => {
  console.error('Admin seed failed.');
  console.error(error);
  process.exitCode = 1;
});
