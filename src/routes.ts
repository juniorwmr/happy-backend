import { Router } from 'express';
import multer from 'multer';

import uploadConfig from './config/upload';

import OrphanagesController from './controllers/OrphanagesController';
import UsersController from './controllers/UsersController';
import { AuthenticateMiddleware } from './middlewares/auth';

const routes = Router();
const upload = multer(uploadConfig);

routes.get('/orphanages', OrphanagesController.index);
routes.get('/orphanages/:id', OrphanagesController.show);

routes.post('/users', UsersController.create);

routes.post('/auth', UsersController.auth);
routes.post('/forget_password', UsersController.forgetPassword);
routes.get(
  '/forget_password/verify/:token',
  UsersController.VerifyForgetPasswordToken
);
routes.post('/forget_password/:token', UsersController.RecoveryPassword);

routes.post(
  '/orphanages',
  AuthenticateMiddleware,
  upload.array('images'),
  OrphanagesController.create
);

export { routes };
