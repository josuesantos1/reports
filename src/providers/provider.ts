import { connectForReports, disconnectDB } from "../database/connection"
import { initializeBucket } from "../storage/minio.client"
import { Cadoc3040 } from "../database/schema/cadoc3040"
import * as cadoc3040 from "./cadoc3040/cadoc3040"
import { Doc3040 } from "../types/cadoc3040"
import { generateZipToMinIO } from "./storage"

export const Provider3040 = async () => {
  await connectForReports()
  await initializeBucket()

  const reference = "01-2026"

  const total = await Cadoc3040.countDocuments()

  const cursor = Cadoc3040.find()
    .sort({ createdAt: -1 })
    .lean<Doc3040>()
    .cursor()

  let index = 0
  const files: Array<{ name: string; content: string }> = []

  for await (const doc of cursor) {
    index++

    if (total === index) {
      doc.TpArq = "F"
    }

    const content = cadoc3040.Run(doc)

    files.push({
      name: `CADOC_3040_${reference}_${index}.xml`,
      content: content
    })
  }

  const zipObjectName = await generateZipToMinIO(files, `CADOC_3040_${reference}.zip`, "3040")

  await disconnectDB()
}

Provider3040()