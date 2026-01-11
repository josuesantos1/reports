import { connectDB, disconnectDB } from '../src/database/connection'
import { Cadoc3040 } from '../src/database/schema/cadoc3040'

type SeedConfig = {
  Cadoc3040: number
  ClientsPerCadoc: number
  OperationsPerClient: number
  GuaranteesPerOperation: number
}

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const pick = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]

const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

const formatDate = (date: Date) =>
  date.toISOString().split('T')[0].replace(/-/g, '')

const cpf = () => String(rand(10000000000, 99999999999)).padStart(11, '0')
const cnpj = () => String(rand(10000000000000, 99999999999999)).padStart(14, '0')
const cep = () => String(rand(10000000, 99999999)).padStart(8, '0')

const genVenc = () => ({
  v110: rand(0, 10000),
  v120: rand(0, 10000),
  v130: rand(0, 10000),
  v140: rand(0, 10000),
  v150: rand(0, 10000)
})

const genContInstFinRes4966 = () => ({
  ClasAtFin: pick(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']),
  CartProvMin: pick(['01', '02', '03', '04', '05', '06', '07', '08', '09']),
  VlrContBr: String(rand(1000, 100000))
})

const genGarantia = () => ({
  Tp: pick(['101', '102', '201', '202', '301', '401', '501', '601', '701', '801', '901', '999']),
  Ident: `GAR-${rand(100000, 999999)}`,
  PercGar: rand(1, 100),
  VlrOrig: rand(1000, 50000),
  VlrData: rand(1000, 50000),
  DtReav: formatDate(randomDate(new Date(), new Date('2030-01-01')))
})

const genOperacao = (guaranteesQty: number) => ({
  DetCli: pick(['1', '2', '3', '4']),
  Contrt: `CONT-${rand(100000, 999999)}`,
  NatuOp: pick(['1', '2', '3', '4', '5', '6', '7', '8', '9']),
  Mod: pick(['101', '102', '201', '202', '301', '302', '401', '402', '501', '601', '701', '801']),
  OrigemRec: pick(['1', '2', '3', '4', '5', '6', '7', '8', '9']),
  Indx: pick(['001', '002', '003', '004', '005', '006', '999']),
  VarCamb: pick(['0', '1', '2', '3']),
  DtVencOp: formatDate(randomDate(new Date(), new Date('2030-01-01'))),
  CEP: cep(),
  TaxEft: rand(100, 5000) / 100,
  DtContr: formatDate(randomDate(new Date('2021-01-01'), new Date())),
  ProvConsttd: rand(100, 10000),
  CaracEspecial: pick(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']),
  IPOC: pick(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']),
  Venc: genVenc(),
  Gar: Array.from({ length: guaranteesQty }, genGarantia),
  ContInstFinRes4966: genContInstFinRes4966()
})

const genCliente = (operationsQty: number, guaranteesQty: number) => {
  const tipo = pick(['1', '2'])

  return {
    Tp: tipo,
    Cd: tipo === '1' ? cpf() : cnpj(),
    Autorzc: pick(['S', 'N']),
    PorteCli: pick(['1', '2', '3', '4', '5']),
    TpCtrl: pick(['1', '2', '3', '4', '5']),
    IniRelactCli: formatDate(randomDate(new Date('2020-01-01'), new Date())),
    CongEcon: String(rand(1, 999)).padStart(3, '0'),
    Op: Array.from({ length: operationsQty }, () => genOperacao(guaranteesQty))
  }
}

const genAgregado = () => ({
  Mod: pick(['101', '102', '201', '202', '301', '302', '401', '402', '501', '601', '701', '801']),
  FaixaVlr: pick(['01', '02', '03', '04', '05', '06']),
  TpCli: pick(['1', '2', '3']),
  TpCtrl: pick(['1', '2', '3', '4', '5']),
  Localiz: pick(['1', '2']),
  OrigemRec: pick(['1', '2', '3', '4', '5', '6', '7', '8', '9']),
  NatuOp: pick(['1', '2', '3', '4', '5', '6', '7', '8', '9']),
  CaracEspecial: pick(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']),
  VincME: pick(['S', 'N']),
  DesempOp: pick(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']),
  QtdOp: rand(1, 100),
  QtdCli: rand(1, 50),
  ProvConsttd: rand(1000, 50000),
  Venc: genVenc()
})

function buildCadoc(config: SeedConfig) {
  const instituicaoCNPJ = cnpj()

  return {
    DtBase: formatDate(randomDate(new Date('2024-01-01'), new Date())),
    CNPJ: instituicaoCNPJ,
    Remessa: String(rand(1, 999)).padStart(3, '0'),
    Parte: String(rand(1, 99)).padStart(2, '0'),
    TpArq: pick(['F', 'P']),
    NomeResp: 'joão',
    EmailResp: 'joao@jbank.com.br',
    TelResp: '11987654321',
    TotalCli: config.ClientsPerCadoc,
    MetodApPE: pick(['S', 'C']),
    MetodDifTJE: pick(['N', 'S']),
    Cli: Array.from(
      { length: config.ClientsPerCadoc },
      () => genCliente(config.OperationsPerClient, config.GuaranteesPerOperation)
    ),
    Agreg: Array.from({ length: rand(5, 15) }, genAgregado)
  }
}


async function seed(config: SeedConfig) {
  await connectDB()

  const docs = Array.from(
    { length: config.Cadoc3040 },
    () => buildCadoc(config)
  )

  await Cadoc3040.insertMany(docs)

  console.log('Seed CADOC 3040 concluído')
  console.table(config)

  await disconnectDB()
}

seed({
  Cadoc3040: 5,
  ClientsPerCadoc: 10,
  OperationsPerClient: 3,
  GuaranteesPerOperation: 1
}).catch(err => {
  console.error(err)
  process.exit(1)
})
