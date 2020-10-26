import { storage } from '../../helpers/google-cloud-storage';

export const deleteImagesFromGCS = async (files: { key: string }[]) => {
  const bucketName = process.env.GCLOUD_BUCKET as string;
  const bucket = storage.bucket(bucketName);

  Promise.all(
    files.map((image) => {
      return new Promise((resolve, reject) => {
        bucket
          .deleteFiles({
            prefix: image.key,
          })
          .then((response) => {
            resolve(response);
          })
          .catch((err) => reject(err));
      });
    })
  )
    .then((response) => response)
    .catch((err) => err);
};
