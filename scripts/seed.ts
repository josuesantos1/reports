import { connectDB, disconnectDB } from '../src/database/connection';
import { Cadoc3040 } from '../src/database/schema/cadoc3040';

type SeedConfig = {
  Cadoc3040: number;
  ClientsPerCadoc: number;
  OperationsPerClient: number;
  GuaranteesPerOperation: number;
};

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const formatDate = (date: Date) =>
  date.toISOString().split('T')[0].replace(/-/g, '');

const cpf = () => String(rand(10000000000, 99999999999)).padStart(11, '0');
const cnpj = () =>
  String(rand(10000000000000, 99999999999999)).padStart(14, '0');
const cep = () => String(rand(10000000, 99999999)).padStart(8, '0');

const genVenc = () => ({
  v110: rand(10000, 100000),
  v120: rand(10000, 100000),
  v130: rand(10000, 100000),
  v140: rand(10000, 100000),
  v150: rand(10000, 100000),
});

const genContInstFinRes4966 = () => ({
  ClasAtFin: pick(['1', '2', '3', '4', '5', '6', '7', '8']),
  CartProvMin: pick(['C1', 'C2', 'C3', 'C4', 'C5', 'C6']),
  VlrContBr: String(rand(1, 10)),
});

const genGarantia = () => {
  const tipo = pick(['0102', '0902', '0201', '0301', '0401', '0501']);
  const hasValue = Math.random() > 0.5;

  return {
    Tp: tipo,
    ...(hasValue && { Ident: String(rand(10000000000, 99999999999999)).padStart(14, '0') }),
    ...(Math.random() > 0.3 && { PercGar: rand(50, 100) }),
    ...(hasValue && { VlrOrig: rand(10000, 500000) }),
    ...(hasValue && { VlrData: rand(10000, 500000) }),
    ...(hasValue && { DtReav: formatDate(randomDate(new Date(), new Date('2030-01-01'))) }),
  };
};

const genOperacao = (clientCd: string, guaranteesQty: number) => {
  const contrato = `${String.fromCharCode(65 + rand(0, 25))}${String.fromCharCode(65 + rand(0, 25))}${String.fromCharCode(65 + rand(0, 25))}${rand(100, 999)}`;
  const detCli = `${clientCd}${String(rand(100, 999)).padStart(6, '0')}`;
  const mod = pick(['0101', '0102', '0201', '0202', '0301', '0302', '0401', '0402', '0501', '0601', '0701', '0801']);
  const instituicao = String(rand(10000000, 99999999));
  const hasCaracEspecial = Math.random() > 0.7;

  return {
    DetCli: detCli,
    Contrt: contrato,
    NatuOp: '01',
    Mod: mod,
    OrigemRec: pick(['0100', '0101', '0200', '0300']),
    Indx: pick(['11', '12', '13', '14', '15', '99']),
    VarCamb: pick(['790', '220', '978', '840']),
    DtVencOp: formatDate(randomDate(new Date(), new Date('2030-01-01'))),
    CEP: cep(),
    TaxEft: (rand(500, 10000) / 100).toFixed(2),
    DtContr: formatDate(randomDate(new Date('2010-01-01'), new Date('2020-01-01'))),
    ProvConsttd: rand(500, 50000),
    ...(hasCaracEspecial && { CaracEspecial: Math.random() > 0.5 ? '02;03' : pick(['01', '02', '03', '04', '05']) }),
    IPOC: `${instituicao}${mod}${clientCd}${contrato}`,
    Venc: genVenc(),
    Gar: Array.from({ length: guaranteesQty }, genGarantia),
    ContInstFinRes4966: genContInstFinRes4966(),
  };
};

const genCliente = (operationsQty: number, guaranteesQty: number) => {
  const tipo = pick(['1', '2']);
  const clientCd = tipo === '1'
    ? String(rand(10000000000, 99999999999)).padStart(11, '0')
    : String(rand(10000000, 99999999)).padStart(8, '0');

  return {
    Tp: tipo,
    Cd: clientCd,
    Autorzc: pick(['S', 'N']),
    PorteCli: pick(['1', '2', '3', '4', '5']),
    TpCtrl: pick(['01', '02', '03', '04', '05']),
    IniRelactCli: formatDate(randomDate(new Date('2010-01-01'), new Date('2020-01-01'))),
    CongEcon: String(rand(0, 999999)).padStart(6, '0'),
    Op: Array.from({ length: operationsQty }, () => genOperacao(clientCd, guaranteesQty)),
  };
};

const genAgregado = () => ({
  Mod: pick(['0101', '0102', '0201', '0202', '0301', '0302', '0401', '0402', '0501', '0601', '0701', '0801']),
  FaixaVlr: pick(['1', '2', '3', '4', '5', '6']),
  TpCli: pick(['1', '2', '3']),
  TpCtrl: pick(['01', '02', '03', '04', '05']),
  Localiz: pick(['10058', '10060', '10070', '10080']),
  OrigemRec: pick(['0100', '0101', '0200', '0300']),
  NatuOp: '01',
  CaracEspecial: pick(['01', '02', '03', '04', '05', '06']),
  VincME: pick(['S', 'N']),
  DesempOp: pick(['01', '02', '03', '04', '05', '06', '07', '08']),
  QtdOp: rand(1000, 50000),
  QtdCli: rand(500, 20000),
  ProvConsttd: rand(100000, 5000000),
  Venc: genVenc(),
});

function buildCadoc(config: SeedConfig, dtBase: string) {
  const instituicaoCNPJ = String(rand(10000000, 99999999)).padStart(8, '0');
  const nomes = [
    'JOSE DA SILVA', 'MARIA SANTOS', 'JOAO OLIVEIRA', 'ANA COSTA', 'PEDRO SOUZA',
    'LUAN SANTA', 'ARTHUR MORGAN', 'JACOB PERALTA',
  ];
  const nome = pick(nomes);
  const email = `${nome.toLowerCase().replace(/ /g, '.')}.@empresa.com.br`;

  return {
    DtBase: dtBase,
    CNPJ: instituicaoCNPJ,
    Remessa: String(rand(1, 10)).padStart(1, '0'),
    Parte: String(rand(1, 10)).padStart(1, '0'),
    TpArq: pick(['F', 'P']),
    NomeResp: nome,
    EmailResp: email,
    TelResp: `11${rand(900000000, 999999999)}`,
    TotalCli: config.ClientsPerCadoc,
    MetodApPE: pick(['S', 'C']),
    MetodDifTJE: pick(['N', 'S']),
    Cli: Array.from({ length: config.ClientsPerCadoc }, () =>
      genCliente(config.OperationsPerClient, config.GuaranteesPerOperation)
    ),
    Agreg: Array.from({ length: rand(5, 15) }, genAgregado),
  };
}

async function seed(config: SeedConfig) {
  await connectDB();

  // Gera dados para os últimos 6 meses (baseado na data atual)
  const now = new Date();
  const baseDates: string[] = [];

  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    baseDates.push(`${year}-${month}`);
  }

  console.log('Gerando dados para as seguintes datas base:', baseDates);

  const docs = baseDates.flatMap((dtBase) =>
    Array.from({ length: config.Cadoc3040 }, () => buildCadoc(config, dtBase))
  );

  await Cadoc3040.insertMany(docs);

  console.log('Seed CADOC 3040 concluído');
  console.log(`Total de documentos gerados: ${docs.length}`);
  console.table(config);

  await disconnectDB();
}

seed({
  Cadoc3040: 5,
  ClientsPerCadoc: 10,
  OperationsPerClient: 3,
  GuaranteesPerOperation: 1,
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
