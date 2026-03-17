import { Client as MinioClient } from "minio";

const toBool = (value) => String(value).toLowerCase() === "true";
const trimSlash = (value = "") => value.replace(/\/+$/, "");

const endpoint = process.env.MINIO_ENDPOINT || "";
const accessKey = process.env.MINIO_ACCESS_KEY || "";
const secretKey = process.env.MINIO_SECRET_KEY || "";
const bucket = process.env.MINIO_BUCKET || "";

const hasMinioConfig = Boolean(endpoint && accessKey && secretKey && bucket);

let minioClient = null;

if (hasMinioConfig) {
  minioClient = new MinioClient({
    endPoint: endpoint,
    port: Number(process.env.MINIO_PORT || 9000),
    useSSL: toBool(process.env.MINIO_USE_SSL),
    accessKey,
    secretKey,
  });
}

const getPublicBaseUrl = () => {
  const explicitBase = trimSlash(process.env.MINIO_PUBLIC_URL || "");
  if (explicitBase) return explicitBase;

  const protocol = toBool(process.env.MINIO_USE_SSL) ? "https" : "http";
  const port = Number(process.env.MINIO_PORT || 9000);
  const isDefaultPort = (protocol === "https" && port === 443) || (protocol === "http" && port === 80);
  return `${protocol}://${endpoint}${isDefaultPort ? "" : `:${port}`}`;
};

export const isMinioEnabled = () => Boolean(minioClient);

export const uploadFileToMinio = async ({ filePath, objectName, contentType = "application/octet-stream" }) => {
  if (!minioClient) {
    throw new Error("MinIO is not configured");
  }

  const bucketExists = await minioClient.bucketExists(bucket);
  if (!bucketExists) {
    await minioClient.makeBucket(bucket, process.env.MINIO_REGION || "us-east-1");
  }

  await minioClient.fPutObject(bucket, objectName, filePath, { "Content-Type": contentType });

  const baseUrl = getPublicBaseUrl();
  return `${baseUrl}/${bucket}/${objectName}`;
};
