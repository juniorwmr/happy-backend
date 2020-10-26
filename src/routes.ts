import { Router } from 'express';
import multer from 'multer';

import uploadConfig from './config/upload';

import OrphanagesController from './controllers/OrphanagesController';
import UsersController from './controllers/UsersController';
import { AuthenticateMiddleware } from './middlewares/auth';

import { sendUploadToGCS } from './middlewares/google-cloud-storage';

const routes = Router();
const upload = multer(uploadConfig);

// Orphanage List
routes.get('/orphanages', OrphanagesController.index);
routes.get('/orphanages/pendents', OrphanagesController.findUnChecked);
routes.get('/orphanages/:id', OrphanagesController.show);

// Create Users
routes.post('/users', UsersController.create);

// Sign In, Sign Up, Forget Password
routes.post('/users/auth', UsersController.auth);
routes.post('/users/forget_password', UsersController.forgetPassword);
routes.get(
  '/users/forget_password/verify/:token',
  UsersController.VerifyForgetPasswordToken
);
routes.post('/users/forget_password/:token', UsersController.ResetPassword);

// Orphanage Create
routes.post(
  '/orphanages',
  [upload.array('images'), sendUploadToGCS],
  OrphanagesController.create
);

// Privates Routes - only with token
routes.put(
  '/orphanages',
  [AuthenticateMiddleware, upload.array('images')],
  OrphanagesController.update
);
routes.delete(
  '/orphanages/:id',
  AuthenticateMiddleware,
  OrphanagesController.delete
);

export { routes };
