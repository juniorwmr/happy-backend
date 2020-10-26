import path from 'path';
import { Storage } from '@google-cloud/storage';

export const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: path.resolve(
    __dirname,
    '..',
    '..',
    process.env.GOOGLE_APPLICATION_CREDENTIALS as string
  ),
});

export const getPublicUrl = (bucketName: string, fileName: string) =>
  `https://storage.googleapis.com/${bucketName}/${fileName}`;
