import { Fragment } from "react";

type Props = {
  filaMin: string;
  filaMax: string;
  columnas: number;
  filaResaltada: string;
  columnaResaltada: number;
};

export function RackVisual({ filaMin, filaMax, columnas, filaResaltada, columnaResaltada }: Props) {
  const filaMinCode = filaMin.charCodeAt(0);
  const filaMaxCode = filaMax.charCodeAt(0);

  // De arriba hacia abajo, con la fila "A" al final (abajo), como en un rack físico.
  const filas: string[] = [];
  for (let c = filaMaxCode; c >= filaMinCode; c--) filas.push(String.fromCharCode(c));

  const columnasArr = Array.from({ length: columnas }, (_, i) => i + 1);

  return (
    <div className="overflow-x-auto rounded-card border border-outline-variant bg-surface-container-lowest p-4">
      <div
        className="grid w-max gap-0.5"
        style={{ gridTemplateColumns: `2rem repeat(${columnas}, minmax(1.75rem, 1fr))` }}
      >
        <div />
        {columnasArr.map((c) => (
          <div
            key={`col-${c}`}
            className="flex items-center justify-center pb-1 text-[10px] font-medium text-on-surface-variant"
          >
            {c}
          </div>
        ))}

        {filas.map((fila) => (
          <Fragment key={fila}>
            <div className="flex items-center justify-center pr-1 text-xs font-semibold text-on-surface-variant">
              {fila}
            </div>
            {columnasArr.map((c) => {
              const activa = fila === filaResaltada && c === columnaResaltada;
              return (
                <div
                  key={`${fila}-${c}`}
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
          </Fragment>
        ))}
      </div>
    </div>
  );
}
