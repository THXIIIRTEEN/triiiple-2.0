import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
    region: 'ru-central1',
    credentials: {
        accessKeyId: process.env.CLOUD_KEY_ID!,
        secretAccessKey: process.env.CLOUD_SECRET_LEY!,
    },
    endpoint: 'https://storage.yandexcloud.net',
});