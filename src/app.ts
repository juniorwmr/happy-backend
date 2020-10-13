import path from 'path';
import express from 'express';
import cors from 'express';

import './database/connection';

import { routes } from './routes';

const app = express();

app.use(express.json());
app.use(cors());
app.use(routes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

export { app };
