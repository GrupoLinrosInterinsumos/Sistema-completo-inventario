// SACCO numera cada puerta de cámara por separado (CC1, CC2, CC3...) pero
// algunas son en realidad la misma refrigeradora física con 2 puertas: CC1+CC2
// son una sola cámara, igual que CC3+CC4. CC5 es una cámara de 2 puertas que
// ya se cuenta como una sola unidad. Esto agrupa por cámara física real para
// que "qué más hay en esta refrigeradora" (chips/hermanos) no se corte a
// mitad de cámara.
const CAMARA_FISICA: Record<string, string> = {
  CC1: "CC1",
  CC2: "CC1",
  CC3: "CC3",
  CC4: "CC3",
};

export function camaraFisica(ubicacionNumero: string): string {
  return CAMARA_FISICA[ubicacionNumero] ?? ubicacionNumero;
}

// Inverso: dado el id de cámara física (ej. "CC1"), qué etiquetas de puerta
// hay que buscar en la base (ej. ["CC1", "CC2"]).
export function puertasDeCamaraFisica(camaraFisicaId: string): string[] {
  return Object.entries(CAMARA_FISICA)
    .filter(([, fisica]) => fisica === camaraFisicaId)
    .map(([puerta]) => puerta)
    .concat(CAMARA_FISICA[camaraFisicaId] ? [] : [camaraFisicaId]);
}
