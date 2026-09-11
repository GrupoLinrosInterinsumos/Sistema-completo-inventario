"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconSearch, IconTrash } from "./icons";

// Busca a medida que se escribe (con un pequeño debounce), sin esperar Enter
// ni un botón "Buscar". Actualiza el query param en la URL, así que la
// página server sigue siendo la que trae los datos — esto solo dispara la
// navegación. `sugerencias` (nombres ya encontrados con el término actual)
// se muestran como lista rápida para no tener que escribir el nombre entero.
export function LiveSearch({
  paramName = "q",
  placeholder,
  sugerencias = [],
}: {
  paramName?: string;
  placeholder: string;
  sugerencias?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [valor, setValor] = useState(searchParams.get(paramName) ?? "");
  const [pending, startTransition] = useTransition();
  const [enfocado, setEnfocado] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (valor.trim()) params.set(paramName, valor);
      else params.delete(paramName);
      startTransition(() => {
        router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
      });
    }, 250);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setEnfocado(false);
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  function limpiar() {
    setValor("");
    setEnfocado(false);
  }

  const sugerenciasFiltradas = sugerencias.filter(
    (s) => s.toLowerCase() !== valor.trim().toLowerCase()
  );
  const mostrarSugerencias = enfocado && valor.trim() !== "" && sugerenciasFiltradas.length > 0;

  return (
    <div ref={contenedorRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <IconSearch
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onFocus={() => setEnfocado(true)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-9 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {pending ? (
            <span
              aria-hidden="true"
              className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-outline-variant border-t-primary"
            />
          ) : null}
        </div>
        {valor ? (
          <button
            type="button"
            onClick={limpiar}
            aria-label="Borrar búsqueda"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-outline-variant text-on-surface-variant transition-colors hover:border-secondary hover:bg-error-container hover:text-on-error-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <IconTrash size={18} />
          </button>
        ) : null}
      </div>

      {mostrarSugerencias ? (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-outline-variant bg-surface-container-lowest shadow-md">
          {sugerenciasFiltradas.slice(0, 8).map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setValor(s);
                  setEnfocado(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-on-surface transition-colors hover:bg-primary-fixed"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
