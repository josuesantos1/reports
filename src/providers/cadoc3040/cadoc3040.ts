import { Builder } from 'xml2js';
import { doc } from './build';
import { run } from 'node:test';
import { Agreg, Cli, Doc3040, Gar, Op, Venc } from '../../types/cadoc3040';

const mapVenc = (v: Venc) => {
  return {
    $: v
  };
}

const mapGar = (g: Gar) => {
  return {
    $: g
  };
}

const mapOp = (op: Op) => {
  return {
    $: {
      DetCli: op.DetCli,
      Contrt: op.Contrt,
      NatuOp: op.NatuOp,
      Mod: op.Mod,
      OrigemRec: op.OrigemRec,
      Indx: op.Indx,
      VarCamb: op.VarCamb,
      DtVencOp: op.DtVencOp,
    //   ClassOp: op.ClassOp,
      CEP: op.CEP,
      TaxEft: op.TaxEft,
      DtContr: op.DtContr,
      ProvConsttd: op.ProvConsttd,
      CaracEspecial: op.CaracEspecial,
    //   Cosif: op.Cosif,
      IPOC: op.IPOC
    },
        Venc: [mapVenc(op.Venc)],
    ...(op.Gar && { Gar: op.Gar.map(mapGar) }),
    ContInstFinRes4966: {
        $: {
            ClasAtFin: op.ContInstFinRes4966.ClasAtFin,
            CartProvMin: op.ContInstFinRes4966.CartProvMin,
            VlrContBr: op.ContInstFinRes4966.VlrContBr
        }
      },
  };
}

const mapCli = (cli: Cli) => {
  return {
    $: {
      Tp: cli.Tp,
      Cd: cli.Cd,
      Autorzc: cli.Autorzc,
      PorteCli: cli.PorteCli,
      TpCtrl: cli.TpCtrl,
      IniRelactCli: cli.IniRelactCli,
      CongEcon: cli.CongEcon,
    //   ClassCli: cli.ClassCli
    },
    Op: cli.Op.map(mapOp)
  };
}

const mapAgreg = (ag: Agreg) => {
  return {
    $: {
      Mod: ag.Mod,
    //   ClassOp: ag.ClassOp,
      FaixaVlr: ag.FaixaVlr,
      TpCli: ag.TpCli,
      TpCtrl: ag.TpCtrl,
      Localiz: ag.Localiz,
      OrigemRec: ag.OrigemRec,
      NatuOp: ag.NatuOp,
      CaracEspecial: ag.CaracEspecial,
      VincME: ag.VincME,
    //   PrzProvm: ag.PrzProvm,
      DesempOp: ag.DesempOp,
      QtdOp: ag.QtdOp,
      QtdCli: ag.QtdCli,
      ProvConsttd: ag.ProvConsttd
    },
    Venc: [mapVenc(ag.Venc)]
  };
}

export const Run = (doc: Doc3040): string => {

    const builder = new Builder({
        xmldec: { version: '1.0', encoding: 'UTF-8' },
        renderOpts: { pretty: true, indent: '' },
        headless: false,
        attrkey: '$',
        charkey: '_'
    });

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
  };


    return builder.buildObject(payload);
}


console.log(Run(doc))