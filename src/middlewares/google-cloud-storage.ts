import { Request, Response, NextFunction } from 'express';
import { storage, getPublicUrl } from '../helpers/google-cloud-storage';

export const sendUploadToGCS = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.files) {
    return next();
  }

  const requestImages = req.files as Express.Multer.File[];
  const bucketName = process.env.GCLOUD_BUCKET as string;
  const bucket = storage.bucket(bucketName);
  requestImages.forEach((image) => {
    const gcsFileName = `${Date.now()}-${image.originalname}`;
    const file = bucket.file(gcsFileName);

    const stream = file.createWriteStream({
      metadata: {
        contentType: image.mimetype,
      },
    });

    stream.on('error', (err) => {
      console.log(err);
      next(err);
    });

    stream.on('finish', async () => {
      image.filename = gcsFileName;

      return file.makePublic().then(() => {
        image.path = getPublicUrl(bucketName, gcsFileName);
        next();
      });
    });

    stream.end(image.buffer);
  });
};
