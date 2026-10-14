"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { ZONAS_FIJAS } from "@/lib/ubicaciones-fijas";
import { moverUbicacionAction } from "../../actions";
import { RackPicker } from "../../rack-picker";

type Rack = { id: string; numero: number; filaMin: string; filaMax: string; columnas: number };
type Ocupante = { rackId: string; fila: string; columna: number; nombreProducto: string };

export function MoverForm({ itemId, racks, ocupadas }: { itemId: string; racks: Rack[]; ocupadas: Ocupante[] }) {
  const router = useRouter();
  // Una sola lista con todas las ubicaciones: "rack:<id>" o "zona:<nombre>".
  const [destino, setDestino] = useState(racks[0] ? `rack:${racks[0].id}` : `zona:${ZONAS_FIJAS[0]}`);
  const [celda, setCelda] = useState<{ fila: string; columna: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const modo: "rack" | "area" = destino.startsWith("rack:") ? "rack" : "area";
  const rackId = modo === "rack" ? destino.slice("rack:".length) : "";
  const areaLibre = modo === "area" ? destino.slice("zona:".length) : "";

  const rackSeleccionado = useMemo(() => racks.find((r) => r.id === rackId), [racks, rackId]);
  const ocupadasDelRack = useMemo(() => ocupadas.filter((o) => o.rackId === rackId), [ocupadas, rackId]);

  function cambiarDestino(nuevo: string) {
    setDestino(nuevo);
    setCelda(null);
    setError(null);
  }

  function alternarCelda(f: string, c: number) {
    setCelda((prev) => (prev && prev.fila === f && prev.columna === c ? null : { fila: f, columna: c }));
    setError(null);
  }

  function enviar() {
    if (modo === "rack" && !celda) {
      setError("Haz clic en la celda de destino.");
      return;
    }
    setError(null);
    const formData = new FormData();
    formData.set("modo", modo);
    if (modo === "rack") {
      formData.set("rackId", rackId);
      formData.set("fila", celda!.fila);
      formData.set("columna", String(celda!.columna));
    } else {
      formData.set("areaLibre", areaLibre);
    }
    startTransition(async () => {
      const result = await moverUbicacionAction(itemId, formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push(`/ubicacion/${result.id}`);
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="mover-destino" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Ubicación
        </label>
        <select
          id="mover-destino"
          value={destino}
          onChange={(e) => cambiarDestino(e.target.value)}
          className="mt-1 w-full max-w-xs rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <optgroup label="Racks">
            {racks.map((r) => (
              <option key={r.id} value={`rack:${r.id}`}>
                Rack {r.numero}
              </option>
            ))}
          </optgroup>
          <optgroup label="Zonas">
            {ZONAS_FIJAS.map((z) => (
              <option key={z} value={`zona:${z}`}>
                {z}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {modo === "rack" ? (
        <>
          <div>
            <p className="block text-label-md uppercase tracking-wide text-on-surface-variant">
              Nueva ubicación — haz clic en la celda de destino
            </p>
            {rackSeleccionado ? (
              <div className="mt-1">
                <RackPicker
                  filaMin={rackSeleccionado.filaMin}
                  filaMax={rackSeleccionado.filaMax}
                  columnas={rackSeleccionado.columnas}
                  ocupadas={ocupadasDelRack}
                  seleccionadas={celda ? [celda] : []}
                  onAlternar={alternarCelda}
                />
              </div>
            ) : null}
            <p className="mt-2 text-sm text-on-surface">
              {celda ? (
                <>
                  Seleccionaste: <span className="font-semibold">Rack {rackSeleccionado?.numero} — {celda.fila}{celda.columna}</span>
                </>
              ) : (
                "Aún no has seleccionado ninguna celda."
              )}
            </p>
          </div>
        </>
      ) : (
        <p className="text-sm text-on-surface">
          Se moverá a <span className="font-semibold">{areaLibre}</span> (zona sin celdas).
        </p>
      )}

      {error ? (
        <p className="rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">{error}</p>
      ) : null}

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="button" loading={pending} onClick={enviar}>
          {pending ? "Moviendo..." : "Mover aquí"}
        </Button>
      </div>
    </div>
  );
}
