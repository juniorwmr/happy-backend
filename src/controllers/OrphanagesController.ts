import { getPublicUrl } from './../helpers/google-cloud-storage';
import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';
import { getRepository } from 'typeorm';
import { deleteImagesFromGCS } from '../middlewares/google-cloud-storages/delete';

import OrphanageView from '../views/orphanages_view';

import Orphanage from '../models/Orphanage.entity';
import Image from '../models/Image.entity';

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
      const imagePath = getPublicUrl(
        process.env.GCLOUD_BUCKET as string,
        image.filename
      );
      return { path: imagePath, key: image.filename };
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
          key: Yup.string().required(),
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

  async update(request: Request, response: Response, next: NextFunction) {
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
      image_key,
    } = request.body;

    const orphanagesRepository = getRepository(Orphanage);
    const imageRepository = getRepository(Image);

    // deleting images from database
    if (image_key) {
      const images_keys = Array.isArray(image_key)
        ? image_key
        : Array(image_key);

      await deleteImagesFromGCS(images_keys);
      images_keys.forEach(async (image) => {
        await imageRepository.delete({ key: image });
      });
    }

    // Adding new images to database
    const requestImages = request.files as Express.Multer.File[];
    if (requestImages) {
      requestImages.forEach(async (image) => {
        const imagePath = getPublicUrl(
          process.env.GCLOUD_BUCKET as string,
          image.filename
        );
        const img = imageRepository.create({
          path: imagePath,
          key: image.filename,
          orphanage: id,
        });
        await imageRepository.save(img);
      });
    }

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

    return response
      .status(204)
      .json({ message: 'Orphanage updated successfully.' });
  },

  async delete(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;
    const orphanage_id = Number(id);

    const orphanageRepository = getRepository(Orphanage);
    const orphanage = await orphanageRepository.findOne(
      { id: orphanage_id },
      {
        relations: ['images'],
      }
    );

    if (!orphanage) {
      return response.status(400).json({ message: 'Orphanage not found.' });
    }

    await deleteImagesFromGCS(orphanage.images);

    await orphanageRepository.delete({ id: orphanage_id });

    return response.status(200).json({ message: 'Orphanage deleted.' });
  },
};
