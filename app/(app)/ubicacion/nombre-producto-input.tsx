"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  id: string;
  nombresSugeridos: string[];
  valor: string;
  onChange: (valor: string) => void;
};

// Campo de texto libre con autocompletar: sugiere nombres ya usados en
// Ubicación o del catálogo mientras se escribe, para no tener que escribir
// el nombre completo — pero sigue siendo texto libre (no obliga a elegir).
export function NombreProductoInput({ id, nombresSugeridos, valor, onChange }: Props) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  const filtro = valor.trim().toLowerCase();
  const coincidencias =
    filtro === ""
      ? []
      : nombresSugeridos.filter((n) => n.toLowerCase().includes(filtro) && n.toLowerCase() !== filtro);

  return (
    <div ref={contenedorRef} className="relative">
      <input
        id={id}
        name="nombreProducto"
        type="text"
        required
        autoComplete="off"
        value={valor}
        onChange={(e) => {
          onChange(e.target.value);
          setAbierto(true);
        }}
        onFocus={() => setAbierto(true)}
        className="mt-1 w-full rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {abierto && coincidencias.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-outline-variant bg-surface-container-lowest shadow-md">
          {coincidencias.slice(0, 8).map((n) => (
            <li key={n}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(n);
                  setAbierto(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-on-surface transition-colors hover:bg-primary-fixed"
              >
                {n}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
