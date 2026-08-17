export function rangoProximosAVencer(dias = 30) {
  const hoy = new Date();
  const limite = new Date();
  limite.setDate(limite.getDate() + dias);
  return { gte: hoy, lte: limite };
}

export type EstadoVencimiento = {
  diasRestantes: number;
  pctVidaUtil: number;
  tone: "secondary" | "warning" | "success";
  chipLabel: string;
  chipVariant: "danger" | "warning" | "info";
};

export function estadoVencimiento(fProduccion: Date, fVencimiento: Date): EstadoVencimiento {
  const ahora = Date.now();
  const total = fVencimiento.getTime() - fProduccion.getTime();
  const restanteMs = fVencimiento.getTime() - ahora;
  const diasRestantes = Math.ceil(restanteMs / 86_400_000);
  const pctVidaUtil = total > 0 ? Math.max(0, Math.min(100, (restanteMs / total) * 100)) : 0;

  if (diasRestantes <= 15) {
    return { diasRestantes, pctVidaUtil, tone: "secondary", chipLabel: `Vence: ${diasRestantes}d`, chipVariant: "danger" };
  }
  if (diasRestantes <= 45) {
    return { diasRestantes, pctVidaUtil, tone: "warning", chipLabel: `Vence: ${diasRestantes}d`, chipVariant: "warning" };
  }
  return { diasRestantes, pctVidaUtil, tone: "success", chipLabel: "Óptimo", chipVariant: "info" };
}
