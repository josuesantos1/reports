import { connectForReports, disconnectDB } from "../database/connection"
import { initializeBucket } from "../storage/minio.client"
import { Cadoc3040 } from "../database/schema/cadoc3040"
import * as cadoc3040 from "./cadoc3040/cadoc3040"
import { Doc3040 } from "../types/cadoc3040"
import { generateZipToMinIO } from "./storage"
import { getSummaryStats } from "../reports/aggregations/cadoc3040.aggregation"
import { createBatchStream } from "../reports/processors/batch.processor"

export const Provider3040 = async () => {
  await connectForReports()
  await initializeBucket()

  const reference = "01-2026"
  const dtBase = "20260101"

  const stats = await Cadoc3040.aggregate(getSummaryStats(dtBase))

  const total = await Cadoc3040.countDocuments()

  const cursor = Cadoc3040.find()
    .sort({ createdAt: -1 })
    .lean<Doc3040>()
    .cursor()

  const files: Array<{ name: string; content: string }> = []
  let processedCount = 0

  const batchProcessor = createBatchStream(50, async (batch: Doc3040[]) => {
    return batch.map((doc, idx) => {
      const globalIndex = processedCount + idx + 1

      if (globalIndex === total) {
        doc.TpArq = "F"
      }

      return cadoc3040.Run(doc)
    })
  })

  batchProcessor.on('data', (xmlBatch: string[]) => {
    xmlBatch.forEach((xml, idx) => {
      const index = processedCount + idx + 1
      files.push({
        name: `CADOC_3040_${reference}_${index}.xml`,
        content: xml
      })
    })
    processedCount += xmlBatch.length
  })

  await new Promise<void>((resolve, reject) => {
    batchProcessor.on('end', resolve)
    batchProcessor.on('error', reject)
    cursor.pipe(batchProcessor)
  })

  const zipObjectName = await generateZipToMinIO(files, `CADOC_3040_${reference}.zip`, "3040")

  await disconnectDB()
}

Provider3040()