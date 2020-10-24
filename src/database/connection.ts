import { createConnection, getConnectionOptions } from 'typeorm';

export const createTypeOrmConnection = async () => {
  return createConnection();
};
