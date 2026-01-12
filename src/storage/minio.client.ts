import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

export const BUCKET_NAME = process.env.MINIO_BUCKET || 'reports';

export const initializeBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);

    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`Bucket "${BUCKET_NAME}" created`);
    } else {
      console.log(`Bucket "${BUCKET_NAME}" already exists`);
    }
  } catch (error) {
    console.error('error on initializer Minio:', error);
    throw error;
  }
};

export { minioClient };
