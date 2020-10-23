require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env.development',
});

const config = {
  type: 'sqlite',
  database: process.env.DATABASE_LOCATION,
  migrations: ['./src/database/migrations/*.ts'],
  entities: ['./src/models/*.ts'],
  cli: {
    migrationsDir: './src/database/migrations',
  },
};

module.exports = config;
