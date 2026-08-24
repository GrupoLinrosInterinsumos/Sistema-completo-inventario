import Link from "next/link";
import { auth } from "@/auth";
import { diaCortoLima, fechaLimaISO, formatFechaUTC } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import type { NombreAlmacenSistema } from "@/lib/sistema-almacen";
import { labelUbicacion } from "@/lib/ubicacion";
import { rangoProximosAVencer } from "@/lib/vencimientos";
import { ActivityChart } from "@/app/components/ui/activity-chart";
import { KpiCard } from "@/app/components/ui/kpi-card";
import { ProgressBar } from "@/app/components/ui/progress-bar";
import { LinkButton } from "@/app/components/ui/link-button";
import { IconAlertTriangle, IconClipboardCheck, IconPackage } from "@/app/components/ui/icons";

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const session = await auth();
  const params = await searchParams;
  // Solo se filtra por almacén cuando se llega desde el tile CRAMER/SACCO de
  // Sistemas Almacén (?almacen=...) — el link "Dashboard" del menú siempre
  // muestra todo, sin quedar "pegado" a la última elección.
  const almacenParam = typeof params.almacen === "string" ? params.almacen : "";
  const sistema: NombreAlmacenSistema | null =
    almacenParam === "CRAMER" || almacenParam === "SACCO" ? almacenParam : null;
  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const hace7Dias = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const filtroAlmacen = sistema ? { almacen: { nombre: sistema } } : {};

  const [skusActivos, skusNuevosEsteMes, lotesPorVencer, ingresosPorDesglosar, porVencer, movimientosSemana] =
    await Promise.all([
      prisma.producto.count({ where: { activo: true, ...filtroAlmacen } }),
      prisma.producto.count({ where: { activo: true, createdAt: { gte: inicioMes }, ...filtroAlmacen } }),
      prisma.inventarioActual.count({
        where: { cantidadDisponible: { gt: 0 }, fVencimiento: rangoProximosAVencer(), ...filtroAlmacen },
      }),
      prisma.ingreso.findMany({
        where: { estado: { in: ["CONFIRMADO", "DESGLOSADO"] }, ...filtroAlmacen },
        select: { detalles: { select: { estadoDesglose: true } } },
      }),
      prisma.inventarioActual.findMany({
        where: { cantidadDisponible: { gt: 0 }, fVencimiento: rangoProximosAVencer(), ...filtroAlmacen },
        include: { producto: true, almacen: true },
        orderBy: { fVencimiento: "asc" },
        take: 6,
      }),
      prisma.movimiento.findMany({
        where: {
          tipo: { in: ["INGRESO", "SALIDA"] },
          fechaHora: { gte: hace7Dias },
          ...(sistema ? { producto: { almacen: { nombre: sistema } } } : {}),
        },
        select: { tipo: true, cantidad: true, fechaHora: true },
      }),
    ]);

  const ingresosPendientes = ingresosPorDesglosar.filter((ingreso) =>
    ingreso.detalles.some((d) => d.estadoDesglose !== "COMPLETO")
  ).length;

  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    return { key: fechaLimaISO(d), label: diaCortoLima(d), ingreso: 0, salida: 0 };
  });
  for (const m of movimientosSemana) {
    const bucket = dias.find((d) => d.key === fechaLimaISO(m.fechaHora));
    if (!bucket) continue;
    if (m.tipo === "INGRESO") bucket.ingreso += m.cantidad;
    else bucket.salida += m.cantidad;
  }

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline-md text-on-surface">
            Resumen General{sistema ? ` — ${sistema}` : ""}
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Hola, {session?.user.name}. Estado actual del inventario y operaciones en curso.
          </p>
        </div>
        <LinkButton href="/kardex" variant="outline">
          Ver Kardex
        </LinkButton>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          icon={<IconPackage size={18} />}
          label="SKUs activos"
          value={skusActivos.toLocaleString("es-PE")}
          helper={skusNuevosEsteMes > 0 ? `+${skusNuevosEsteMes} nuevos este mes` : "Sin nuevos este mes"}
        />
        <KpiCard
          icon={<IconAlertTriangle size={18} />}
          label="Lotes por vencer (30d)"
          value={lotesPorVencer}
          tone={lotesPorVencer > 0 ? "critical" : "neutral"}
          chipLabel={lotesPorVencer > 0 ? "Requiere acción" : "Al día"}
          chipVariant={lotesPorVencer > 0 ? "danger" : "success"}
        />
        <Link href="/inventario" className="block rounded-card transition-transform hover:scale-[1.01]">
          <KpiCard
            icon={<IconClipboardCheck size={18} />}
            label="Ingresos pendientes"
            value={ingresosPendientes.toLocaleString("es-PE")}
            tone={ingresosPendientes > 0 ? "critical" : "neutral"}
            chipLabel={ingresosPendientes > 0 ? "Por desglosar" : "Al día"}
            chipVariant={ingresosPendientes > 0 ? "warning" : "success"}
            helper="Ingresos confirmados sin repartir en paletas/cajas"
          />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-outline-variant bg-surface-container-lowest p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm text-on-surface">Alerta de vencimiento</h2>
            <Link href="/stock?vencePronto=1" className="text-xs font-semibold text-primary hover:text-primary-container">
              Ver todo
            </Link>
          </div>

          {porVencer.length === 0 ? (
            <p className="mt-4 text-body-sm text-on-surface-variant">
              No hay productos venciendo en los próximos 30 días.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {porVencer.map((fila) => {
                const total = fila.fVencimiento.getTime() - fila.fProduccion.getTime();
                const restante = fila.fVencimiento.getTime() - now.getTime();
                const pct = total > 0 ? Math.max(0, Math.min(100, (restante / total) * 100)) : 0;
                const tone = pct < 20 ? "secondary" : pct < 50 ? "warning" : "success";
                return (
                  <li key={fila.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-on-surface">{fila.producto.nombreSabor}</span>
                      <span className="text-xs text-on-surface-variant">
                        Vence {formatFechaUTC(fila.fVencimiento)}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {fila.almacen.nombre} · {labelUbicacion(fila.almacen.tipoUbicacion)} {fila.ubicacionNumero} /
                      Caja {fila.nCaja}
                    </p>
                    <div className="mt-1.5">
                      <ProgressBar value={pct} max={100} tone={tone} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-card border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-headline-sm text-on-surface">Actividad (últimos 7 días)</h2>
          <p className="text-body-sm text-on-surface-variant">Volumen de ingresos vs salidas (kg)</p>
          <div className="mt-4">
            <ActivityChart data={dias} />
          </div>
        </div>
      </div>
    </div>
  );
}
