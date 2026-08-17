"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const EPSILON = 0.001;

export type FilaDesglose = {
  ubicacionNumero: string;
  nCaja: string;
  cantidadKg: number;
};

export type DesgloseActionResult = { error: string } | { ok: true };

async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("No autorizado.");
  return session;
}

function validarFilas(filas: FilaDesglose[]): string | null {
  if (filas.length === 0) return null;
  for (const fila of filas) {
    if (!fila.ubicacionNumero.trim()) return "Cada caja debe tener una ubicación (paleta/slot).";
    if (!fila.nCaja.trim()) return "Cada caja debe tener un N° de caja.";
    if (!(fila.cantidadKg > 0)) return "La cantidad de cada caja debe ser mayor a 0.";
  }
  return null;
}

async function getDetalleConContexto(ingresoDetalleId: string) {
  return prisma.ingresoDetalle.findUniqueOrThrow({
    where: { id: ingresoDetalleId },
    include: {
      producto: true,
      ingreso: { include: { almacen: true } },
      desgloses: true,
    },
  });
}

function calcularEstadoDesglose(totalDistribuido: number, cantidadTotal: number) {
  if (totalDistribuido <= EPSILON) return "PENDIENTE" as const;
  if (totalDistribuido >= cantidadTotal - EPSILON) return "COMPLETO" as const;
  return "PARCIAL" as const;
}

export async function guardarDesgloseAction(
  ingresoDetalleId: string,
  filas: FilaDesglose[]
): Promise<DesgloseActionResult> {
  await requireSession();

  if (filas.length === 0) return { error: "Agrega al menos una caja antes de guardar." };
  const errorFilas = validarFilas(filas);
  if (errorFilas) return { error: errorFilas };

  const detalle = await getDetalleConContexto(ingresoDetalleId);

  if (detalle.ingreso.estado === "BORRADOR") {
    return { error: "Este ingreso todavía no ha sido confirmado." };
  }

  const yaDistribuido = detalle.desgloses.reduce((acc, d) => acc + d.cantidadKg, 0);
  const nuevoTotal = filas.reduce((acc, f) => acc + f.cantidadKg, 0);

  if (yaDistribuido + nuevoTotal > detalle.cantidadTotal + EPSILON) {
    const restante = Math.max(0, detalle.cantidadTotal - yaDistribuido);
    return {
      error: `La suma supera lo ingresado. Restante disponible: ${restante} ${detalle.unidad}.`,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.inventarioDesglose.createMany({
      data: filas.map((f) => ({
        ingresoDetalleId: detalle.id,
        productoId: detalle.productoId,
        lote: detalle.lote,
        fProduccion: detalle.fProduccion,
        fVencimiento: detalle.fVencimiento,
        ubicacionNumero: f.ubicacionNumero.trim(),
        nCaja: f.nCaja.trim(),
        cantidadKg: f.cantidadKg,
      })),
    });

    await tx.ingresoDetalle.update({
      where: { id: detalle.id },
      data: { estadoDesglose: calcularEstadoDesglose(yaDistribuido + nuevoTotal, detalle.cantidadTotal) },
    });
  });

  revalidatePath("/inventario");
  revalidatePath(`/inventario/${detalle.ingresoId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function subirAStockAction(
  ingresoDetalleId: string,
  filasNuevas: FilaDesglose[]
): Promise<DesgloseActionResult> {
  const session = await requireSession();

  if (filasNuevas.length > 0) {
    const guardado = await guardarDesgloseAction(ingresoDetalleId, filasNuevas);
    if ("error" in guardado) return guardado;
  }

  const detalle = await getDetalleConContexto(ingresoDetalleId);
  const pendientes = detalle.desgloses.filter((d) => !d.subidoAStock);

  if (pendientes.length === 0) {
    return { error: "No hay cajas pendientes de subir a stock." };
  }

  await prisma.$transaction(async (tx) => {
    for (const fila of pendientes) {
      const inventarioActual = await tx.inventarioActual.upsert({
        where: {
          productoId_almacenId_ubicacionNumero_nCaja_lote: {
            productoId: fila.productoId,
            almacenId: detalle.ingreso.almacenId,
            ubicacionNumero: fila.ubicacionNumero,
            nCaja: fila.nCaja,
            lote: fila.lote,
          },
        },
        create: {
          productoId: fila.productoId,
          almacenId: detalle.ingreso.almacenId,
          ubicacionNumero: fila.ubicacionNumero,
          nCaja: fila.nCaja,
          lote: fila.lote,
          fProduccion: fila.fProduccion,
          fVencimiento: fila.fVencimiento,
          cantidadDisponible: fila.cantidadKg,
        },
        update: {
          cantidadDisponible: { increment: fila.cantidadKg },
        },
      });

      await tx.movimiento.create({
        data: {
          tipo: "INGRESO",
          inventarioActualId: inventarioActual.id,
          productoId: fila.productoId,
          cantidad: fila.cantidadKg,
          usuarioId: session.user.id,
          referencia: `Ingreso N° ${detalle.ingreso.nHoja} (${detalle.ingreso.almacen.nombre})`,
        },
      });

      await tx.inventarioDesglose.update({
        where: { id: fila.id },
        data: { subidoAStock: true },
      });
    }

    if (detalle.ingreso.estado === "CONFIRMADO") {
      await tx.ingreso.update({
        where: { id: detalle.ingresoId },
        data: { estado: "DESGLOSADO" },
      });
    }
  });

  revalidatePath("/inventario");
  revalidatePath(`/inventario/${detalle.ingresoId}`);
  revalidatePath("/dashboard");
  revalidatePath("/stock");
  revalidatePath("/stock/buscar");
  return { ok: true };
}
