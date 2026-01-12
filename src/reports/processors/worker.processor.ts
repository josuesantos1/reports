import { Worker } from 'worker_threads';
import { cpus } from 'os';

export const createWorkerPool = (workerScript: string, maxWorkers?: number) => {
  const workers: Worker[] = [];
  const queue: Array<{
    data: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  let activeWorkers = 0;
  const maxWorkersCount = maxWorkers || cpus().length;

  const processQueue = () => {
    if (queue.length === 0) return;
    if (activeWorkers >= maxWorkersCount) return;

    const task = queue.shift();
    if (!task) return;

    activeWorkers++;

    const worker = new Worker(workerScript, {
      workerData: task.data,
    });

    worker.on('message', (result) => {
      task.resolve(result);
      activeWorkers--;
      worker.terminate();
      processQueue();
    });

    worker.on('error', (error) => {
      task.reject(error);
      activeWorkers--;
      worker.terminate();
      processQueue();
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        task.reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  };

  return {
    async execute<T, R>(data: T): Promise<R> {
      return new Promise((resolve, reject) => {
        queue.push({ data, resolve, reject });
        processQueue();
      });
    },

    async processInParallel<T, R>(items: T[]): Promise<R[]> {
      const promises = items.map((item) => this.execute<T, R>(item));
      return Promise.all(promises);
    },

    async terminate() {
      await Promise.all(workers.map((w) => w.terminate()));
      workers.length = 0;
    },
  };
};

export const processWithWorkers = async <T, R>(
  items: T[],
  workerScript: string,
  chunkSize: number = 10
): Promise<R[]> => {
  const pool = createWorkerPool(workerScript);
  const results: R[] = [];

  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    const chunkResults = await pool.execute<T[], R[]>(chunk);
    results.push(...chunkResults);
  }

  await pool.terminate();
  return results;
};
