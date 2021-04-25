require('dotenv').config();

import path from 'path';
import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';

import { errorHandler } from './errors/handler';
import { routes } from './routes';

import createTypeOrmConnection from './database/connection';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(routes);

// Handles Errors
app.use(errorHandler);

createTypeOrmConnection();
app.listen(process.env.PORT || 3333);

export default app;
