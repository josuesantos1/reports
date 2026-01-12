import { Cadoc3040 } from '../../database/schema/cadoc3040'
import { Doc3040 } from '../../types/cadoc3040'
import * as cadoc3040 from '../../providers/cadoc3040/cadoc3040'
import { getSummaryStats } from '../aggregations/cadoc3040.aggregation'
import { processWithWorkers } from '../processors/worker.processor'
import { createBatchStream } from '../processors/batch.processor'
import { createMapStream } from '../processors/stream.processor'
import path from 'path'

export interface ReportOptions {
  useAggregation?: boolean
  useWorkers?: boolean
  useStreams?: boolean
  batchSize?: number
}

export const generateReport = async (
  dtBase: string,
  options: ReportOptions = {}
) => {
  const {
    useAggregation = false,
    useWorkers = false,
    useStreams = true,
    batchSize = 100
  } = options

  if (useAggregation) {
    const stats = await Cadoc3040.aggregate(getSummaryStats(dtBase))
  }

  const total = await Cadoc3040.countDocuments({ DtBase: dtBase })

  if (useWorkers) {
    return await generateWithWorkers(dtBase, batchSize)
  }

  if (useStreams) {
    return await generateWithStreams(dtBase, batchSize)
  }

  return await generateSequential(dtBase)
}

const generateWithWorkers = async (dtBase: string, batchSize: number) => {
  const docs = await Cadoc3040.find({ DtBase: dtBase }).lean<Doc3040[]>()

  const workerScript = path.join(__dirname, '../workers/xml.worker.js')

  const results = await processWithWorkers<Doc3040, string>(
    docs,
    workerScript,
    batchSize
  )

  return results
}

const generateWithStreams = async (dtBase: string, batchSize: number) => {
  const cursor = Cadoc3040.find({ DtBase: dtBase })
    .lean<Doc3040>()
    .cursor()

  const results: string[] = []

  const batchStream = createBatchStream(batchSize, async (batch: Doc3040[]) => {
    return batch.map(doc => cadoc3040.Run(doc))
  })

  batchStream.on('data', (xmls: string[]) => {
    results.push(...xmls)
  })

  return new Promise<string[]>((resolve, reject) => {
    batchStream.on('end', () => resolve(results))
    batchStream.on('error', reject)

    cursor.pipe(batchStream)
  })
}

const generateSequential = async (dtBase: string) => {
  const cursor = Cadoc3040.find({ DtBase: dtBase })
    .lean<Doc3040>()
    .cursor()

  const results: string[] = []

  for await (const doc of cursor) {
    results.push(cadoc3040.Run(doc))
  }

  return results
}
