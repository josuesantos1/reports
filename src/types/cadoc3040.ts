export interface Doc3040 {
  DtBase: string;
  CNPJ: string;
  Remessa: string;
  Parte: string;
  TpArq: 'F' | 'P';
  NomeResp: string;
  EmailResp: string;
  TelResp: string;
  TotalCli: number;
  MetodApPE: 'S' | 'C';
  MetodDifTJE: 'N' | 'S';
  Cli?: Cli[];
  Agreg?: Agreg[];
}

export interface Cli {
  Tp: string;
  Cd: string;
  Autorzc: 'S' | 'N';
  PorteCli: string;
  TpCtrl: string;
  IniRelactCli: string;
  CongEcon: string;
  // ClassCli: string;
  Op: Op[];
}

export interface Op {
  DetCli: string;
  Contrt: string;
  NatuOp: string;
  Mod: string;
  OrigemRec: string;
  Indx: string;
  VarCamb: string;
  DtVencOp: string;
  // ClassOp: string;
  CEP: string;
  TaxEft: number;
  DtContr: string;
  ProvConsttd: number;
  CaracEspecial?: string;
  // Cosif: string;
  IPOC: string;
  Venc: Venc;
  Gar?: Gar[];
  ContInstFinRes4966: ContInstFinRes4966;
}

export interface Gar {
  Tp: string;
  Ident?: string;
  PercGar?: number;
  VlrOrig?: number;
  VlrData?: number;
  DtReav?: string;
}

export interface Agreg {
  Mod: string;
  // ClassOp: string;
  FaixaVlr: string;
  TpCli: string;
  TpCtrl: string;
  Localiz: string;
  OrigemRec: string;
  NatuOp: string;
  CaracEspecial: string;
  VincME: 'S' | 'N';
  // PrzProvm: "S" | "N";
  DesempOp: string;
  QtdOp: number;
  QtdCli: number;
  ProvConsttd: number;
  Venc: Venc;
}

export interface Venc {
  v110?: number;
  v120?: number;
  v130?: number;
  v140?: number;
  v150?: number;
}

export interface ContInstFinRes4966 {
  ClasAtFin: string;
  CartProvMin: string;
  VlrContBr: string;
}
