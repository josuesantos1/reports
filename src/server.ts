import Fastify from 'fastify';
import { connectDB } from './database/connection';
import { initializeBucket } from './storage/minio.client';
import { reportsRoutes } from './api/routes/reports.routes';
import 'dotenv/config';

const fastify = Fastify({
  logger: true,
});

fastify.get('/', async () => {
  return {
    status: 'ok',
    service: 'Report System',
    version: '1.0.0',
  };
});

fastify.register(reportsRoutes);

const start = async () => {
  try {
    await connectDB();
    await initializeBucket();
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3000');
    console.log('POST /reports - Generate reports');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
