import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import OrphanageView from '../views/orphanages_view';

import { Orphanage } from '../models/Orphanage';
import { Image } from '../models/Image';

export default {
  async index(_: any, response: Response) {
    const orphanagesRepository = getRepository(Orphanage);
    const orphanages = await orphanagesRepository.find({
      where: {
        check: true,
      },
      relations: ['images'],
    });

    return response.status(200).json(OrphanageView.renderMany(orphanages));
  },

  async findUnChecked(_: any, response: Response) {
    const orphanagesRepository = getRepository(Orphanage);
    const orphanages = await orphanagesRepository.find({
      where: {
        check: false,
      },
      relations: ['images'],
    });

    return response.status(200).json(OrphanageView.renderMany(orphanages));
  },

  async show(request: Request, response: Response) {
    const { id } = request.params;
    const orphanagesRepository = getRepository(Orphanage);
    const orphanage = await orphanagesRepository.findOneOrFail(id, {
      relations: ['images'],
    });

    return response.status(200).json(OrphanageView.render(orphanage));
  },

  async create(request: Request, response: Response) {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
    } = request.body;

    const orphanagesRepository = getRepository(Orphanage);
    const requestImages = request.files as Express.Multer.File[];
    const images = requestImages.map((image) => {
      return { path: image.filename };
    });

    const data = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends: open_on_weekends === 'true',
      images,
    };

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
      about: Yup.string().required(),
      instructions: Yup.string().required(),
      opening_hours: Yup.string().required(),
      open_on_weekends: Yup.boolean().required(),
      images: Yup.array(
        Yup.object().shape({
          path: Yup.string().required(),
        })
      ),
    });

    await schema.validate(data, {
      abortEarly: false,
    });

    const orphanage = orphanagesRepository.create(data);
    await orphanagesRepository.save(orphanage);

    return response.status(201).json(orphanage);
  },

  async update(request: Request, response: Response) {
    const {
      id,
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
      check,
      id_images_remove,
    } = request.body;

    const orphanagesRepository = getRepository(Orphanage);
    const imageRepository = getRepository(Image);

    // Update datas except images
    await orphanagesRepository.update(
      { id },
      {
        name,
        latitude,
        longitude,
        about,
        instructions,
        opening_hours,
        open_on_weekends: open_on_weekends === 'true',
        check: check === 'true',
      }
    );

    // Deleting image from Folder
    if (id_images_remove) {
      const images_to_remove = Array.isArray(id_images_remove)
        ? id_images_remove
        : Array(id_images_remove);
      console.log(id_images_remove);
      images_to_remove.forEach(async (image_id: string) => {
        const response = await imageRepository.findOne({
          id: Number(image_id),
        });
        fs.unlink(
          path.join(__dirname, '..', '..', 'uploads', response.path),
          async (err) => {
            if (err) {
              console.log('failed to delete local image: ' + err);
            } else {
              // Deleting image from DATABASE
              await imageRepository.delete({ id: Number(image_id) });
              console.log('successfully deleted local image');
            }
          }
        );
      });
    }

    // Adding new images
    const requestImages = request.files as Express.Multer.File[];
    const new_images = requestImages.map((image) => {
      return imageRepository.create({ path: image.filename, orphanage: id });
    });
    imageRepository.save(new_images);

    return response
      .status(204)
      .json({ message: 'Orphanage updated successfully.' });
  },

  async delete(request: Request, response: Response) {
    const { id } = request.params;
    const orphanage_id = Number(id);
    if (!id) {
      return response
        .status(400)
        .json({ message: 'No orphanage id provided.' });
    }
    const orphanageRepository = getRepository(Orphanage);
    await orphanageRepository.delete({ id: orphanage_id });

    return response.status(200).json({ message: 'Orphanage deleted.' });
  },
};
