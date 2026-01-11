import archiver from "archiver"
import { PassThrough } from "stream"
import { uploadStream } from "../storage/storage.service"

export type ZipFile = {
  name: string
  content: string
}

export const generateZip = async (
  files: ZipFile[],
  output: NodeJS.WritableStream
) => {
  const archive = archiver("zip", { zlib: { level: 9 } })

  archive.pipe(output)

  for (const file of files) {
    archive.append(file.content, { name: file.name })
  }

  await archive.finalize()
}

export const generateZipToMinIO = async (
  files: Array<{ name: string; content: string }>,
  zipFileName: string,
  provider: string
): Promise<string> => {
  const archive = archiver("zip", { zlib: { level: 9 } })
  const passThrough = new PassThrough()

  archive.pipe(passThrough)

  for (const file of files) {
    archive.append(file.content, { name: file.name })
  }

  archive.finalize()

  const objectName = await uploadStream(
    zipFileName,
    passThrough,
    "application/zip",
    {
      folder: provider
    }
  )

  return objectName
}
