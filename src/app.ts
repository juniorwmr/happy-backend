require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env.development',
});

import path from 'path';
import express from 'express';
import 'express-async-errors';
import cors from 'cors';

import { errorHandler } from './errors/handler';

import { routes } from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Handles Errors
app.use(errorHandler);

export { app };
