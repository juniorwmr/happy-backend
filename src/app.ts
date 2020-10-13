require('dotenv').config();

import path from 'path';
import express from 'express';
import 'express-async-errors';
import cors from 'express';

import './database/connection';
import { errorHandler } from './errors/handler';

import { routes } from './routes';

const app = express();

app.use(express.json());
app.use(cors());
app.use(routes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Handles Errors
app.use(errorHandler);

export { app };
