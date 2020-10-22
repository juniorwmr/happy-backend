import { createConnection, getConnectionOptions } from 'typeorm';
import * as config from '../../ormconfig';

export const createTypeOrmConnection = async () => {
  return createConnection({
    ...config.default,
  });
};
