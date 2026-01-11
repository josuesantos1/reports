import Fastify from 'fastify'
import { connectDB } from './database/connection'
import { initializeBucket } from './storage/minio.client'
import 'dotenv/config'


const fastify = Fastify({
  logger: true,
})

fastify.get('/', async () => {
  return { hello: 'world' }
})

const start = async () => {
  try {
    await connectDB()
    await initializeBucket()
    await fastify.listen({ port: 3000 })
    console.log('Server running on http://localhost:3000')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
