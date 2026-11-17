import { Fragment } from "react";
import { RackFrame } from "./rack-frame";
import { RackScroll } from "./rack-scroll";

type Props = {
  filaMin: string;
  filaMax: string;
  columnas: number;
  filaResaltada: string;
  columnaResaltada: number;
  // Racks cuya numeración arranca por la derecha (ver lib/racks.ts).
  invertido?: boolean;
};

export function RackVisual({ filaMin, filaMax, columnas, filaResaltada, columnaResaltada, invertido = false }: Props) {
  const filaMinCode = filaMin.charCodeAt(0);
  const filaMaxCode = filaMax.charCodeAt(0);

  // De arriba hacia abajo, con la fila "A" al final (abajo), como en un rack físico.
  const filas: string[] = [];
  for (let c = filaMaxCode; c >= filaMinCode; c--) filas.push(String.fromCharCode(c));

  const columnasArr = Array.from({ length: columnas }, (_, i) => (invertido ? columnas - i : i + 1));
  const sombraDivisor = invertido
    ? "inset 2px 0 0 0 var(--color-primary)"
    : "inset -2px 0 0 0 var(--color-primary)";

  return (
    <RackFrame>
      <RackScroll
        alFinal={invertido}
        className="overflow-x-auto rounded-card border border-outline-variant bg-surface-container-lowest p-4"
      >
        <div
          className="grid w-max gap-0.5"
          style={{
            gridTemplateColumns: invertido
              ? `repeat(${columnas}, minmax(1.75rem, 1fr)) 2rem`
              : `2rem repeat(${columnas}, minmax(1.75rem, 1fr))`,
          }}
        >
          {invertido ? null : <div />}
          {columnasArr.map((c) => (
            <div
              key={`col-${c}`}
              className="flex items-center justify-center pb-1 text-[10px] font-medium text-on-surface-variant"
            >
              {c}
            </div>
          ))}
          {invertido ? <div /> : null}

          {filas.map((fila) => (
            <Fragment key={fila}>
              {invertido ? null : (
                <div className="flex items-center justify-center pr-1 text-xs font-semibold text-on-surface-variant">
                  {fila}
                </div>
              )}
              {columnasArr.map((c) => {
                const activa = fila === filaResaltada && c === columnaResaltada;
                const divisor = c % 2 === 0 && c !== columnas;
                return (
                  <div
                    key={`${fila}-${c}`}
                    style={divisor && !activa ? { boxShadow: sombraDivisor } : undefined}
                    className={`m-0.5 flex aspect-square items-center justify-center rounded text-[9px] font-semibold transition-colors ${
                      activa
                        ? "bg-primary text-on-primary ring-2 ring-primary-container ring-offset-1"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {activa ? `${fila}${c}` : ""}
                  </div>
                );
              })}
              {invertido ? (
                <div className="flex items-center justify-center pl-1 text-xs font-semibold text-on-surface-variant">
                  {fila}
                </div>
              ) : null}
            </Fragment>
          ))}
        </div>
      </RackScroll>
    </RackFrame>
  );
}
