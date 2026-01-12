import { Transform, TransformCallback } from 'stream'
import { Doc3040 } from '../../types/cadoc3040'

export const createBatchStream = (
  batchSize: number,
  processFn: (batch: Doc3040[]) => Promise<string[]>
) => {
  let batch: Doc3040[] = []

  return new Transform({
    objectMode: true,

    async transform(doc: Doc3040, encoding: string, callback: TransformCallback) {
      batch.push(doc)

      if (batch.length >= batchSize) {
        const results = await processFn(batch)
        this.push(results)
        batch = []
      }

      callback()
    },

    async flush(callback: TransformCallback) {
      if (batch.length > 0) {
        const results = await processFn(batch)
        this.push(results)
        batch = []
      }
      callback()
    }
  })
}
