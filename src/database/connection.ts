import { createConnection } from 'typeorm';
import connectionOptions from '../ormconfig';

const createTypeOrmConnection = async () => {
  await createConnection(connectionOptions as any);
};

export default createTypeOrmConnection;
