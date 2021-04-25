import { createConnection } from 'typeorm';

const createTypeOrmConnection = async () => {
  await createConnection();
};

export default createTypeOrmConnection;
