"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { ProgressBar } from "@/app/components/ui/progress-bar";
import { IconAlertTriangle, IconCheck, IconClock } from "@/app/components/ui/icons";
import type { EstadoVencimiento } from "@/lib/vencimientos";
import { retirarStockAction } from "./actions";
import { UbicacionChips } from "./ubicacion-chips";
import { FridgeIcon } from "./fridge-icon";
import { PalletIcon } from "./pallet-icon";

const CHIP_ICON: Record<EstadoVencimiento["chipVariant"], React.ReactNode> = {
  danger: <IconAlertTriangle size={12} />,
  warning: <IconClock size={12} />,
  info: <IconCheck size={12} />,
};

type Hermano = { nCaja: string; nombreSabor: string };

type Props = {
  inventarioActualId: string;
  nombreSabor: string;
  ubicacionLabel: string;
  ubicacionNumero: string;
  nCaja: string;
  lote: string;
  cantidadDisponible: number;
  unidad: string;
  estado: EstadoVencimiento;
  hermanos?: Hermano[];
};

export function RetirarStock({
  inventarioActualId,
  nombreSabor,
  ubicacionLabel,
  ubicacionNumero,
  nCaja,
  lote,
  cantidadDisponible,
  unidad,
  estado,
  hermanos = [],
}: Props) {
  const router = useRouter();
  const idPrefix = useId();
  const esRefrigeradora = ubicacionLabel.toLowerCase().includes("refrigeradora");
  const esPaleta = ubicacionLabel.toLowerCase().includes("paleta");
  const [abierto, setAbierto] = useState(false);
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmarRetiro() {
    const valor = Number(cantidad);
    if (!(valor > 0)) {
      setError("Ingresa una cantidad mayor a 0.");
      return;
    }
    if (!motivo) {
      setError("Selecciona un motivo de retiro.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await retirarStockAction(inventarioActualId, valor, motivo);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setAbierto(false);
      setCantidad("");
      setMotivo("");
      router.refresh();
    });
  }

  return (
    <Card accent={estado.chipVariant === "danger" || estado.chipVariant === "warning" ? "secondary" : "primary"}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-on-surface">{nombreSabor}</h3>
          <Badge variant={estado.chipVariant} icon={CHIP_ICON[estado.chipVariant]}>
            {estado.chipLabel}
          </Badge>
        </div>

        <div className="mt-3 flex items-start gap-3">
          {esRefrigeradora ? <FridgeIcon size={36} /> : null}
          {esPaleta ? <PalletIcon numero={ubicacionNumero} caja={nCaja} size={36} /> : null}
          <div className="grid flex-1 grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-on-surface-variant">Ubicación</p>
              <p className="text-on-surface">
                {ubicacionLabel} {ubicacionNumero} / Caja {nCaja}
              </p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Lote</p>
              <p className="text-on-surface">{lote}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span>Vida útil restante</span>
            <span className="font-semibold text-on-surface">
              {cantidadDisponible} {unidad}
            </span>
          </div>
          <div className="mt-1">
            <ProgressBar value={estado.pctVidaUtil} max={100} tone={estado.tone} />
          </div>
        </div>

        <UbicacionChips label={`${ubicacionLabel} ${ubicacionNumero}`} nCajaActual={nCaja} hermanos={hermanos} />
      </div>

      <div className="border-t border-outline-variant p-4">
        {!abierto ? (
          <Button variant="primary" size="sm" className="w-full" onClick={() => setAbierto(true)}>
            Retirar Stock
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={`${idPrefix}-cantidad`} className="block text-xs font-medium text-on-surface-variant">
                  Cantidad a retirar
                </label>
                <input
                  id={`${idPrefix}-cantidad`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor={`${idPrefix}-motivo`} className="block text-xs font-medium text-on-surface-variant">
                  Motivo
                </label>
                <select
                  id={`${idPrefix}-motivo`}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Selecciona...</option>
                  <option value="Movimiento interno">Movimiento interno</option>
                  <option value="Venta">Venta</option>
                </select>
              </div>
            </div>

            {error ? (
              <p className="rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">{error}</p>
            ) : null}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setAbierto(false)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" className="flex-1" loading={pending} onClick={confirmarRetiro}>
                Confirmar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
