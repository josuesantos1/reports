import archiver from 'archiver';
import { PassThrough, Readable } from 'stream';
import {
  uploadStream,
  downloadStream,
  deleteFile,
} from '../storage/storage.service';

export type ZipFile = {
  name: string;
  content: string;
};

export const generateZip = async (
  files: ZipFile[],
  output: NodeJS.WritableStream
) => {
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);

  for (const file of files) {
    archive.append(file.content, { name: file.name });
  }

  await archive.finalize();
};

export const generateZipToMinIO = async (
  files: Array<{ name: string; content: string }>,
  zipFileName: string,
  provider: string
): Promise<string> => {
  const preFolder = `pre-${provider}`;
  const uploadedFiles: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const xmlStream = Readable.from(Buffer.from(file.content, 'utf-8'));

    const objectName = await uploadStream(
      file.name,
      xmlStream,
      'application/xml',
      { folder: preFolder }
    );

    uploadedFiles.push(objectName);
  }

  const archive = archiver('zip', { zlib: { level: 9 } });
  const passThrough = new PassThrough();

  archive.pipe(passThrough);

  for (const objectName of uploadedFiles) {
    const fileStream = await downloadStream(objectName);
    const fileName = objectName.split('/').pop() || objectName;
    archive.append(fileStream, { name: fileName });
  }

  const uploadPromise = uploadStream(
    zipFileName,
    passThrough,
    'application/zip',
    { folder: provider }
  );

  await archive.finalize();

  const zipObjectName = await uploadPromise;

  for (let i = 0; i < uploadedFiles.length; i++) {
    await deleteFile(uploadedFiles[i]);
  }

  return zipObjectName;
};
