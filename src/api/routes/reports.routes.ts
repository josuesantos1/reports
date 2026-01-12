import { FastifyInstance } from 'fastify';
import { generateReport3040 } from '../controllers/reports.controller';

export const reportsRoutes = async (fastify: FastifyInstance) => {
  fastify.post<{
    Body: { reports: string[] };
  }>('/reports', async (request, reply) => {
    const { reports } = request.body;

    if (!reports || !Array.isArray(reports)) {
      return reply.status(400).send({
        error: 'Invalid request',
        message: 'reports must be an array',
      });
    }

    const results = [];

    for (const reportType of reports) {
      if (reportType === '3040') {
        const result = await generateReport3040();
        results.push(result);
      } else {
        results.push({
          reportType,
          status: 'error',
          message: `Unknown report type: ${reportType}`,
        });
      }
    }

    return reply.send({
      success: true,
      results,
    });
  });
};
