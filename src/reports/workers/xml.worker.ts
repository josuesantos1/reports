import { parentPort, workerData } from 'worker_threads'
import { Builder } from 'xml2js'
import { Doc3040 } from '../../types/cadoc3040'
import { mapAgreg, mapCli } from '../../providers/cadoc3040/build'

const generateXML = (doc: Doc3040): string => {
  const builder = new Builder({
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    renderOpts: { pretty: true, indent: '' },
    headless: false,
    attrkey: '$',
    charkey: '_'
  })

  const payload = {
    Doc3040: {
      $: {
        DtBase: doc.DtBase,
        CNPJ: doc.CNPJ,
        Remessa: doc.Remessa,
        Parte: doc.Parte,
        TpArq: doc.TpArq,
        NomeResp: doc.NomeResp,
        EmailResp: doc.EmailResp,
        TelResp: doc.TelResp,
        TotalCli: doc.TotalCli,
        MetodDifTJE: doc.MetodDifTJE,
        MetodApPE: doc.MetodApPE
      },
      ...(doc.Cli && { Cli: doc.Cli.map(mapCli) }),
      ...(doc.Agreg && { Agreg: doc.Agreg.map(mapAgreg) })
    }
  }

  return builder.buildObject(payload)
}

if (parentPort) {
  const docs: Doc3040[] = workerData

  const results = docs.map(doc => generateXML(doc))

  parentPort.postMessage(results)
}
