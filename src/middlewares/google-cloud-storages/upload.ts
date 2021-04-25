import { Request, Response, NextFunction } from 'express';
import { storage, getPublicUrl } from '../../helpers/google-cloud-storage';

export const sendImagesToGCS = async (
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

  Promise.all(
    requestImages.map(async (image) => {
      return new Promise((resolve, reject) => {
        const gcsFileName = `${Date.now()}-${image.originalname}`;
        const file = bucket.file(gcsFileName);

        const stream = file.createWriteStream({
          metadata: {
            contentType: image.mimetype,
            public: true,
          },
        });

        stream.on('error', (err) => {
          reject(err);
        });

        stream.on('finish', () => {
          image.filename = gcsFileName;
          file.makePublic().then(() => {
            image.path = getPublicUrl(bucketName, gcsFileName);
          });
          resolve(image.path);
        });
        stream.end(image.buffer);
      });
    })
  )
    .then(() => {
      next();
    })
    .catch((err) => console.log(err));
};
