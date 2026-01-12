import { model, Schema } from 'mongoose';

const VencSchema = new Schema(
  {
    v110: { type: Number },
    v120: { type: Number },
    v130: { type: Number },
    v140: { type: Number },
    v150: { type: Number },
  },
  { _id: false }
);

const ContInstFinRes4966Schema = new Schema(
  {
    ClasAtFin: { type: String, required: true },
    CartProvMin: { type: String, required: true },
    VlrContBr: { type: String, required: true },
  },
  { _id: false }
);

const GarSchema = new Schema(
  {
    Tp: { type: String, required: true },
    Ident: { type: String },
    PercGar: { type: Number },
    VlrOrig: { type: Number },
    VlrData: { type: Number },
    DtReav: { type: String },
  },
  { _id: false }
);

const OpSchema = new Schema(
  {
    DetCli: { type: String, required: true },
    Contrt: { type: String, required: true },
    NatuOp: { type: String, required: true },
    Mod: { type: String, required: true },
    OrigemRec: { type: String, required: true },
    Indx: { type: String, required: true },
    VarCamb: { type: String, required: true },
    DtVencOp: { type: String, required: true },
    CEP: { type: String, required: true },
    TaxEft: { type: Number, required: true },
    DtContr: { type: String, required: true },
    ProvConsttd: { type: Number, required: true },
    CaracEspecial: { type: String },
    IPOC: { type: String, required: true },
    Venc: { type: VencSchema, required: true },
    Gar: [GarSchema],
    ContInstFinRes4966: { type: ContInstFinRes4966Schema, required: true },
  },
  { _id: false }
);

const CliSchema = new Schema(
  {
    Tp: { type: String, required: true },
    Cd: { type: String, required: true, index: true },
    Autorzc: { type: String, enum: ['S', 'N'], required: true },
    PorteCli: { type: String, required: true },
    TpCtrl: { type: String, required: true },
    IniRelactCli: { type: String, required: true },
    CongEcon: { type: String, required: true },
    Op: [OpSchema],
  },
  { _id: false }
);

const AgregSchema = new Schema(
  {
    Mod: { type: String, required: true },
    FaixaVlr: { type: String, required: true },
    TpCli: { type: String, required: true },
    TpCtrl: { type: String, required: true },
    Localiz: { type: String, required: true },
    OrigemRec: { type: String, required: true },
    NatuOp: { type: String, required: true },
    CaracEspecial: { type: String, required: true },
    VincME: { type: String, enum: ['S', 'N'], required: true },
    DesempOp: { type: String, required: true },
    QtdOp: { type: Number, required: true },
    QtdCli: { type: Number, required: true },
    ProvConsttd: { type: Number, required: true },
    Venc: { type: VencSchema, required: true },
  },
  { _id: false }
);

export const Cadoc3040Schema = new Schema(
  {
    DtBase: { type: String, required: true, index: true },
    CNPJ: { type: String, required: true, index: true },
    Remessa: { type: String, required: true },
    Parte: { type: String, required: true },
    TpArq: { type: String, enum: ['F', 'P'], required: true },
    NomeResp: { type: String, required: true },
    EmailResp: { type: String, required: true },
    TelResp: { type: String, required: true },
    TotalCli: { type: Number, required: true },
    MetodApPE: { type: String, enum: ['S', 'C'], required: true },
    MetodDifTJE: { type: String, enum: ['N', 'S'], required: true },
    Cli: [CliSchema],
    Agreg: [AgregSchema],
  },
  {
    collection: 'cadoc_3040',
    timestamps: true,
  }
);

export const Cadoc3040 = model('Cadoc3040', Cadoc3040Schema);
