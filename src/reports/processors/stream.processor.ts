import { Transform, TransformCallback } from 'stream';
import { Doc3040 } from '../../types/cadoc3040';

export const createMapStream = (
  mapFn: (doc: Doc3040, index: number) => string | Promise<string>
) => {
  let index = 0;

  return new Transform({
    objectMode: true,

    async transform(
      doc: Doc3040,
      encoding: string,
      callback: TransformCallback
    ) {
      try {
        const result = await mapFn(doc, index++);
        this.push(result);
        callback();
      } catch (error) {
        callback(error as Error);
      }
    },
  });
};
