
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
  accessKeyId: process.env.S3_ACCESS_ID,
  secretAccessKey: process.env.S3_ACCESS_KEY,
  s3ForcePathStyle: true, // Needed for MinIO
});

const BUCKET_NAME = process.env.S3_BUCKET ?? 'app';

function getFileKey(fileName: string, userId: string) {
  const randomSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2);
  return `${userId}/${randomSuffix}_${fileName}`;
}

async function uploadFile(file: File, userId: string) {
  const key = getFileKey(file.name, userId);
  const s3Obj = await s3.putObject({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
  }).promise();

  return {
    key,
    s3Obj,
  }
}

async function uploadPresignedUrl(fileName: string, fileType: string, userId: string) {
  const key = getFileKey(fileName, userId);
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: 60 * 5, // 5 minutes
    ContentType: fileType,
  };

  const signedUrl = await s3.getSignedUrlPromise('putObject', params);
  return {
    uploadUrl: signedUrl,
    key,
  }
}

function getFileUrl(fileName: string) {
  return s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Expires: 60 * 60, // 1 hour
  });
}

function deleteFile(fileName: string) {
  return s3.deleteObject({
    Bucket: BUCKET_NAME,
    Key: fileName,
  }).promise();
}

async function getBlobFile(fileKey: string): Promise<Blob> {
  const streamData = s3.getObject({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  }).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of streamData) {
    chunks.push(chunk);
  }
  const blobParts = chunks.map(chunk => new Uint8Array(chunk));
  return new Blob(blobParts);
}

export { uploadFile, getFileUrl, deleteFile, uploadPresignedUrl, getBlobFile };