import { Readable } from 'stream'
import { minioClient, BUCKET_NAME } from './minio.client'

export interface UploadOptions {
  folder?: string
  metadata?: Record<string, string>
}

export const uploadStream = async (
  fileName: string,
  stream: Readable,
  contentType: string,
  options?: UploadOptions
): Promise<string> => {
  const objectName = options?.folder ? `${options.folder}/${fileName}` : fileName

  const metadata = {
    'Content-Type': contentType,
    ...options?.metadata
  }

  await minioClient.putObject(BUCKET_NAME, objectName, stream, undefined, metadata)

  return objectName
}

export const uploadBuffer = async (
  fileName: string,
  content: string | Buffer,
  contentType: string,
  options?: UploadOptions
): Promise<string> => {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf-8')
  const stream = Readable.from(buffer)

  return uploadStream(fileName, stream, contentType, options)
}

export const downloadStream = async (objectName: string): Promise<Readable> => {
  return await minioClient.getObject(BUCKET_NAME, objectName)
}

export const getDownloadUrl = async (objectName: string, expirySeconds = 86400): Promise<string> => {
  return await minioClient.presignedGetObject(BUCKET_NAME, objectName, expirySeconds)
}

export const listFiles = async (prefix?: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const files: string[] = []
    const stream = minioClient.listObjects(BUCKET_NAME, prefix, true)

    stream.on('data', (obj) => {
      if (obj.name) files.push(obj.name)
    })

    stream.on('end', () => resolve(files))
    stream.on('error', reject)
  })
}

export const deleteFile = async (objectName: string): Promise<void> => {
  await minioClient.removeObject(BUCKET_NAME, objectName)
}

export const fileExists = async (objectName: string): Promise<boolean> => {
  try {
    await minioClient.statObject(BUCKET_NAME, objectName)
    return true
  } catch (error) {
    return false
  }
}
