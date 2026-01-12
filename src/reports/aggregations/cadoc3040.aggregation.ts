import { PipelineStage } from 'mongoose';

export const aggregateByClient = (dtBase?: string): PipelineStage[] => {
  return [
    ...(dtBase ? [{ $match: { DtBase: dtBase } }] : []),
    { $unwind: { path: '$Cli', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: {
          DtBase: '$DtBase',
          CNPJ: '$CNPJ',
          ClientCd: '$Cli.Cd',
        },
        totalOperations: { $sum: { $size: { $ifNull: ['$Cli.Op', []] } } },
        totalProvision: {
          $sum: {
            $reduce: {
              input: { $ifNull: ['$Cli.Op', []] },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.ProvConsttd'] },
            },
          },
        },
        operations: { $push: '$Cli.Op' },
      },
    },
    { $sort: { totalProvision: -1 } },
  ];
};

export const getSummaryStats = (dtBase: string): PipelineStage[] => {
  return [
    { $match: { DtBase: dtBase } },
    {
      $group: {
        _id: '$DtBase',
        totalDocuments: { $sum: 1 },
        totalClients: { $sum: { $size: { $ifNull: ['$Cli', []] } } },
        totalInstitutions: { $addToSet: '$CNPJ' },
      },
    },
    {
      $project: {
        _id: 0,
        dtBase: '$_id',
        totalDocuments: 1,
        totalClients: 1,
        totalInstitutions: { $size: '$totalInstitutions' },
      },
    },
  ];
};

export const aggregateByOperationType = (dtBase: string): PipelineStage[] => {
  return [
    { $match: { DtBase: dtBase } },
    { $unwind: '$Cli' },
    { $unwind: '$Cli.Op' },
    {
      $group: {
        _id: {
          modality: '$Cli.Op.Mod',
          riskLevel: '$Cli.Op.IPOC',
        },
        count: { $sum: 1 },
        totalProvision: { $sum: '$Cli.Op.ProvConsttd' },
        avgProvision: { $avg: '$Cli.Op.ProvConsttd' },
      },
    },
    { $sort: { totalProvision: -1 } },
  ];
};

export const preCalculateAggregates = (): PipelineStage[] => {
  return [
    { $unwind: { path: '$Agreg', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: {
          DtBase: '$DtBase',
          Mod: '$Agreg.Mod',
          TpCli: '$Agreg.TpCli',
        },
        totalOps: { $sum: '$Agreg.QtdOp' },
        totalClients: { $sum: '$Agreg.QtdCli' },
        totalProvision: { $sum: '$Agreg.ProvConsttd' },
      },
    },
    {
      $project: {
        _id: 0,
        dtBase: '$_id.DtBase',
        modality: '$_id.Mod',
        clientType: '$_id.TpCli',
        summary: {
          operations: '$totalOps',
          clients: '$totalClients',
          provision: '$totalProvision',
        },
      },
    },
  ];
};
