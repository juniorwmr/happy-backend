import { app } from './app';
import { createTypeOrmConnection } from './database/connection';

const startServer = async () => {
  await createTypeOrmConnection();
  app.listen(3333);
};

startServer();
