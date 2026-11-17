"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { marcarVaciosAction } from "./actions";

export type ResultadoUbicacion = {
  id: string;
  nombreProducto: string;
  ubicacion: string;
  href: string;
  lote: string | null;
  vencimiento: string | null;
};

export function ResultadosLista({ resultados }: { resultados: ResultadoUbicacion[] }) {
  const router = useRouter();
  const q = useSearchParams().get("q") ?? "";
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const todosMarcados = resultados.length > 0 && seleccionados.size === resultados.length;

  function alternar(id: string) {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function alternarTodos() {
    setSeleccionados(todosMarcados ? new Set() : new Set(resultados.map((r) => r.id)));
  }

  function marcarVacios() {
    setError(null);
    startTransition(async () => {
      const result = await marcarVaciosAction([...seleccionados]);
      if (result && "error" in result) {
        setError(result.error);
        return;
      }
      setSeleccionados(new Set());
      router.refresh();
    });
  }

  function moverSeleccionados() {
    // En el orden en que se ven en la lista, para que el reparto sea predecible.
    const ids = resultados.filter((r) => seleccionados.has(r.id)).map((r) => r.id);
    const params = new URLSearchParams({ ids: ids.join(",") });
    if (q) params.set("q", q);
    router.push(`/ubicacion/mover-bloque?${params.toString()}`);
  }

  return (
    <div className="mt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-card border border-outline-variant bg-surface-container-low px-4 py-2.5">
        <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
          <input
            type="checkbox"
            checked={todosMarcados}
            onChange={alternarTodos}
            className="h-5 w-5 shrink-0 rounded border-outline-variant text-primary focus:ring-primary"
          />
          {seleccionados.size > 0
            ? `${seleccionados.size} de ${resultados.length} seleccionada${seleccionados.size === 1 ? "" : "s"}`
            : `Seleccionar todas (${resultados.length})`}
        </label>
        {seleccionados.size > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSeleccionados(new Set())}>
              Cancelar
            </Button>
            <Button variant="outline" size="sm" onClick={moverSeleccionados}>
              Mover seleccionadas
            </Button>
            <Button variant="danger" size="sm" loading={pending} onClick={marcarVacios}>
              Marcar como vacías
            </Button>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mb-3 rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">{error}</p>
      ) : null}

      <ul className="divide-y divide-outline-variant overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
        {resultados.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-4 py-3">
            <input
              type="checkbox"
              checked={seleccionados.has(r.id)}
              onChange={() => alternar(r.id)}
              aria-label={`Seleccionar ${r.nombreProducto}`}
              className="h-5 w-5 shrink-0 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <Link href={r.href} className="min-w-0 flex-1">
              <p className="truncate text-xs text-on-surface-variant">{r.nombreProducto}</p>
              <p className="truncate text-lg font-bold leading-snug text-primary">{r.ubicacion}</p>
              {r.lote || r.vencimiento ? (
                <p className="truncate text-xs text-on-surface-variant">
                  {[r.lote ? `Lote ${r.lote}` : null, r.vencimiento ? `Vence ${r.vencimiento}` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
