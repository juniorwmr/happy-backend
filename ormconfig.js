require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env.development',
});

const config = {
  type: process.env.TYPEORM_DBTYPE,
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  migrations: [process.env.TYPEORM_MIGRATIONS],
  entities: [process.env.TYPEORM_ENTITIES],
  cli: {
    migrationsDir: process.env.TYPEORM_MIGRATIONS_DIR,
  },
};

module.exports = config;
