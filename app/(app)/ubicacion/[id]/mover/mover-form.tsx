"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { moverUbicacionAction } from "../../actions";
import { RackPicker } from "../../rack-picker";

type Rack = { id: string; numero: number; filaMin: string; filaMax: string; columnas: number };
type Ocupante = { rackId: string; fila: string; columna: number; nombreProducto: string };

export function MoverForm({ itemId, racks, ocupadas }: { itemId: string; racks: Rack[]; ocupadas: Ocupante[] }) {
  const router = useRouter();
  const [modo, setModo] = useState<"rack" | "area">("rack");
  const [rackId, setRackId] = useState(racks[0]?.id ?? "");
  const [celda, setCelda] = useState<{ fila: string; columna: number } | null>(null);
  const [areaLibre, setAreaLibre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const rackSeleccionado = useMemo(() => racks.find((r) => r.id === rackId), [racks, rackId]);
  const ocupadasDelRack = useMemo(() => ocupadas.filter((o) => o.rackId === rackId), [ocupadas, rackId]);

  function cambiarRack(nuevoRackId: string) {
    setRackId(nuevoRackId);
    setCelda(null);
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
    if (modo === "area" && !areaLibre.trim()) {
      setError("Escribe el nombre de la zona.");
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
      formData.set("areaLibre", areaLibre.trim());
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
        <p className="block text-label-md uppercase tracking-wide text-on-surface-variant">Tipo de ubicación</p>
        <div className="mt-1.5 flex gap-2">
          <button
            type="button"
            onClick={() => setModo("rack")}
            className={`rounded-chip px-3 py-1.5 text-sm font-medium transition-colors ${
              modo === "rack" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            Rack
          </button>
          <button
            type="button"
            onClick={() => setModo("area")}
            className={`rounded-chip px-3 py-1.5 text-sm font-medium transition-colors ${
              modo === "area" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            Área libre (Piso, Gabinete...)
          </button>
        </div>
      </div>

      {modo === "rack" ? (
        <>
          <div>
            <label htmlFor="mover-rack" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
              Rack
            </label>
            <select
              id="mover-rack"
              value={rackId}
              onChange={(e) => cambiarRack(e.target.value)}
              className="mt-1 w-full max-w-xs rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {racks.map((r) => (
                <option key={r.id} value={r.id}>
                  Rack {r.numero}
                </option>
              ))}
            </select>
          </div>

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
        <div>
          <label htmlFor="mover-area" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Nombre de la zona
          </label>
          <input
            id="mover-area"
            type="text"
            value={areaLibre}
            onChange={(e) => setAreaLibre(e.target.value)}
            placeholder="Ej. Piso, Gabinete, Saldo químico 3..."
            className="mt-1 w-full max-w-xs rounded-md border border-outline-variant px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
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
