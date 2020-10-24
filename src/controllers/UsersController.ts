import { Request, Response } from 'express';
import crypto from 'crypto';
import * as Yup from 'yup';
import { getRepository } from 'typeorm';
import { transportMail } from './../providers/Mail';
import User from '../models/User';

export default {
  async auth(request: Request, response: Response) {
    const { email, password } = request.body;

    const schema = Yup.object().shape({
      email: Yup.string().required(),
      password: Yup.string().required(),
    });

    await schema.validate(
      { email, password },
      {
        abortEarly: false,
      }
    );

    const usersRepository = getRepository(User);
    const user = await usersRepository.findOne({ email });
    if (!user) {
      return response.status(401).json({
        auth: false,
        message: 'Invalid e-mail.',
      });
    }
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return response.status(401).json({
        auth: false,
        message: 'Invalid password.',
      });
    }
    const { accessToken, expiresIn } = user.createToken(user);
    return response.status(200).json({
      auth: true,
      token: accessToken,
      expiresIn,
    });
  },

  async create(request: Request, response: Response) {
    const { name, email, password } = request.body;

    try {
      const usersRepository = getRepository(User);
      const user = await usersRepository.findOne({ email });
      if (user) {
        return response.status(400).json({ message: 'User already exists.' });
      }
      const new_user = usersRepository.create({
        name,
        email,
        password,
      });
      await usersRepository.save(new_user);

      return response
        .status(201)
        .json({ name: new_user.name, email: new_user.email });
    } catch (error) {
      return response.json({ message: error });
    }
  },

  async forgetPassword(request: Request, response: Response) {
    const { email } = request.body;

    const usersRepository = getRepository(User);
    const user = await usersRepository.findOne({ email });

    if (!user) {
      return response.status(400).json({ message: 'User not found.' });
    }

    const token = crypto.randomBytes(20).toString('hex');

    const now = new Date();
    now.setHours(now.getHours() + 1);

    user.reset_password_token = token;
    user.reset_password_date_expires = now;

    await usersRepository.save(user);

    transportMail.sendMail({
      to: email,
      from: 'happy@company.com.br',
      subject: 'Recuperação de Senha',
      html: `<p>Você esqueceu sua senha? Não tem problema! <a href=${
        process.env.WEB + '/forget_password/' + token
      }>Clique aqui</a> para recuperar sua senha de forma segura.</p></div>`,
    });

    response.status(200).json({
      message: 'E-mail sent successfully.',
    });
  },

  async VerifyForgetPasswordToken(request: Request, response: Response) {
    const { token } = request.params;
    if (!token) {
      return response.status(401).json({ message: 'No token provided.' });
    }

    try {
      const usersRepository = getRepository(User);
      const user = await usersRepository.findOne({
        reset_password_token: token,
      });

      if (!user) {
        return response.status(400).json({ message: 'Token incorrect.' });
      }

      const now = new Date();
      const reset_password_date = new Date(user.reset_password_date_expires);
      if (reset_password_date < now) {
        return response.status(400).json({
          message: 'Token has expired. ',
        });
      }

      return response.status(200).json({
        email: user.email,
      });
    } catch (error) {
      return response.json({ message: error });
    }
  },

  async ResetPassword(request: Request, response: Response) {
    const { token } = request.params;
    const { email, password } = request.body;

    if (!token) {
      return response.status(400).json({ message: 'No token provided.' });
    }

    const usersRepository = getRepository(User);

    const user = await usersRepository.findOne({ email });

    if (!user) {
      return response.status(400).json({
        message: 'Usuário não encontrado.',
      });
    }

    user.reset_password_token = '';

    user.password = password;
    await user.hashPassword();

    await usersRepository.save(user);

    response.status(202).json({
      message: 'Password changed successfully.',
    });
  },
};
