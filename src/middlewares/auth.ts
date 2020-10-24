import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import secretKey from '../config/secretKey';

export const AuthenticateMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const authHeader: string | undefined = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({ message: 'No token provided.' });
  }

  const parts: string[] = authHeader.split(' ');

  if (parts.length !== 2) {
    return response.status(401).json({ message: 'Token error.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return response.status(401).json({ message: 'Token malformatted.' });
  }

  jwt.verify(token, secretKey.secret, (err, decoded) => {
    if (err) {
      return response.status(401).json({ error: 'Token invalid.' });
    }
  });

  next();
};
