import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { User } from '../models/User';

export default {
  async auth(request: any, response: Response) {
    const { email, password } = request.body;

    const usersRepository = getRepository(User);
    const user = await usersRepository.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      response.status(200).json({
        message: true,
      });
    }

    return response.status(400).json({
      message: 'Invalid e-mail or password.',
    });
  },

  async create(request: Request, response: Response) {
    const { name, email, password } = request.body;

    const data = {
      name,
      email,
      password,
    };

    const usersRepository = getRepository(User);
    const user = usersRepository.create(data);
    await usersRepository.save(user);

    return response.status(201).json(user);
  },
};
