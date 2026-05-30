const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const REGION = process.env.AWS_REGION || 'us-east-2';
const BUCKET = process.env.AWS_S3_BUCKET_NAME;

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const isConfigured = () =>
  Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && BUCKET);

/**
 * Upload a file buffer to S3 and return the stored object key.
 */
async function uploadBuffer(key, buffer, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return key;
}

/**
 * Generate a temporary signed URL to stream/download a private object.
 * Default expiry is 6 hours so a lecture can be watched without re-fetching.
 */
function getPlaybackUrl(key, expiresIn = 6 * 60 * 60) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
}

async function deleteObject(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

module.exports = { s3, BUCKET, REGION, isConfigured, uploadBuffer, getPlaybackUrl, deleteObject };
