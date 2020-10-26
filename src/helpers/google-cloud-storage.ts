import path from 'path';
import { Storage } from '@google-cloud/storage';

export const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: path.resolve(__dirname, '../../happy-293607-a2c4b1791974.json'),
});

export const getPublicUrl = (bucketName: string, fileName: string) =>
  `https://storage.googleapis.com/${bucketName}/${fileName}`;
