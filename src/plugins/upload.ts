import sharp from "sharp";
import fp from "fastify-plugin";
import { v4 as uuidv4 } from "uuid";
import { BlobServiceClient } from "@azure/storage-blob";

declare module "fastify" {
  interface FastifyInstance {
    uploadFile(
      file: MultipartFile,
      containerName: string,
    ): Promise<{
      url: string;
      fileName: string;
      thumbnailUrl: string;
      thumbnailName: string;
    }>;
    getFile(
      fileName: string,
      containerName: string,
    ): Promise<NodeJS.ReadableStream>;
    deleteFile(
      filename: string | string[],
      containerName: string,
    ): Promise<void>;
  }
}

export interface MultipartFile {
  buffer: Buffer;
  filename: string;
  size: number;
  mimetype: string;
  fieldname: string;
}

export default fp(async (fastify) => {
  fastify.decorate(
    "uploadFile",
    async (file: MultipartFile, containerName: string) => {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const fileServiceUrl = process.env.FILE_SERVICE_URL;

      if (!connectionString || !fileServiceUrl) {
        throw new Error(
          "Azure Storage connection string or file service URL is not set.",
        );
      }

      const blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);
      const containerClient =
        blobServiceClient.getContainerClient(containerName);
      const exists = await containerClient.exists();
      if (!exists) {
        await containerClient.create({});
      }

      const fileName = uuidv4() + "-" + file.filename;
      const thumbnailFileName = "thumbnail-" + fileName;
      const blobClient = containerClient.getBlockBlobClient(fileName);
      const thumbnailBlobClient =
        containerClient.getBlockBlobClient(thumbnailFileName);

      const thumbnailBuffer = await sharp(file.buffer)
        .jpeg({ quality: 70 })
        .png({ compressionLevel: 8, quality: 70 })
        .resize({ width: 100, height: 100 }) // Adjust thumbnail size here
        .toBuffer();

      await blobClient.upload(file.buffer, file.size, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });

      await thumbnailBlobClient.upload(
        thumbnailBuffer,
        thumbnailBuffer.length,
        {
          blobHTTPHeaders: { blobContentType: file.mimetype },
        },
      );

      return {
        url: fileServiceUrl + new URL(blobClient.url).pathname,
        fileName,
        thumbnailUrl:
          fileServiceUrl + new URL(thumbnailBlobClient.url).pathname,
        thumbnailName: thumbnailFileName,
      };
    },
  );

  fastify.decorate(
    "getFile",
    async (fileName: string, containerName: string) => {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

      if (!connectionString) {
        throw new Error("Azure Storage connection string is not set.");
      }

      const blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);
      const containerClient =
        blobServiceClient.getContainerClient(containerName);
      const blobClient = containerClient.getBlockBlobClient(fileName);
      const blobDownloaded = await blobClient.download();
      if (!blobDownloaded.readableStreamBody) {
        throw new Error("Failed to download the file.");
      }
      return blobDownloaded.readableStreamBody;
    },
  );

  fastify.decorate(
    "deleteFile",
    async (filename: string | string[], containerName: string) => {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

      if (!connectionString) {
        throw new Error("Azure Storage connection string is not set.");
      }

      const blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);
      const containerClient =
        blobServiceClient.getContainerClient(containerName);

      if (Array.isArray(filename)) {
        for (const element of filename) {
          const name = element.replace(`/${containerName}/`, "");
          const blobClient = containerClient.getBlockBlobClient(name);
          await blobClient.deleteIfExists();
        }
      } else {
        const name = filename.replace(`/${containerName}/`, "");
        const blobClient = containerClient.getBlockBlobClient(name);
        await blobClient.deleteIfExists();
      }
    },
  );
});
