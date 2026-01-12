import { Agreg, Cli, Gar, Op, Venc } from '../../types/cadoc3040';

const mapVenc = (v: Venc) => {
  return {
    $: v,
  };
};

const mapGar = (g: Gar) => {
  return {
    $: g,
  };
};

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
      IPOC: op.IPOC,
    },
    Venc: [mapVenc(op.Venc)],
    ...(op.Gar && { Gar: op.Gar.map(mapGar) }),
    ContInstFinRes4966: {
      $: {
        ClasAtFin: op.ContInstFinRes4966.ClasAtFin,
        CartProvMin: op.ContInstFinRes4966.CartProvMin,
        VlrContBr: op.ContInstFinRes4966.VlrContBr,
      },
    },
  };
};

export const mapCli = (cli: Cli) => {
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
    Op: cli.Op.map(mapOp),
  };
};

export const mapAgreg = (ag: Agreg) => {
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
      ProvConsttd: ag.ProvConsttd,
    },
    Venc: [mapVenc(ag.Venc)],
  };
};
