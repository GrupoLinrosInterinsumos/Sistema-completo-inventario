"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type LineaInput = {
  productoId: string;
  lote: string;
  fProduccion: string;
  fVencimiento: string;
  cantidadTotal: number;
  unidad: string;
};

export type IngresoInput = {
  almacenId: string;
  guiaTraslado: string;
  lineas: LineaInput[];
};

export type IngresoActionResult = { error: string } | { id: string };

function validar(input: IngresoInput): string | null {
  if (!input.almacenId) return "Selecciona un almacén.";
  if (input.lineas.length === 0) return "Agrega al menos un producto a la lista.";
  for (const linea of input.lineas) {
    if (!linea.productoId) return "Cada línea debe tener un producto.";
    if (!linea.lote.trim()) return "Cada línea debe tener un lote.";
    if (!linea.fProduccion || !linea.fVencimiento) {
      return "Cada línea debe tener fecha de producción y de vencimiento.";
    }
    if (!(linea.cantidadTotal > 0)) return "La cantidad debe ser mayor a 0.";
    if (!linea.unidad) return "Selecciona la unidad (kg o cajas) de cada línea.";
  }
  return null;
}

async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("No autorizado.");
  return session;
}

export async function createIngresoAction(
  input: IngresoInput,
  confirmar: boolean
): Promise<IngresoActionResult> {
  const session = await requireSession();
  const error = validar(input);
  if (error) return { error };

  const ingreso = await prisma.$transaction(async (tx) => {
    const almacen = await tx.almacen.update({
      where: { id: input.almacenId },
      data: { contadorFolio: { increment: 1 } },
    });

    return tx.ingreso.create({
      data: {
        almacenId: almacen.id,
        responsableId: session.user.id,
        nHoja: almacen.contadorFolio,
        guiaTraslado: input.guiaTraslado.trim() || null,
        estado: confirmar ? "CONFIRMADO" : "BORRADOR",
        detalles: {
          create: input.lineas.map((l) => ({
            productoId: l.productoId,
            lote: l.lote.trim(),
            fProduccion: new Date(l.fProduccion),
            fVencimiento: new Date(l.fVencimiento),
            cantidadTotal: l.cantidadTotal,
            unidad: l.unidad,
          })),
        },
      },
    });
  });

  revalidatePath("/ingresos");
  return { id: ingreso.id };
}

export async function updateIngresoAction(
  id: string,
  input: IngresoInput,
  confirmar: boolean
): Promise<IngresoActionResult> {
  const session = await requireSession();

  const existing = await prisma.ingreso.findUniqueOrThrow({ where: { id } });
  if (existing.estado === "CONFIRMADO" && session.user.rol !== "SUPERVISOR") {
    return { error: "Solo un supervisor puede editar un ingreso ya confirmado." };
  }

  const error = validar(input);
  if (error) return { error };

  await prisma.$transaction(async (tx) => {
    await tx.ingresoDetalle.deleteMany({ where: { ingresoId: id } });
    await tx.ingreso.update({
      where: { id },
      data: {
        guiaTraslado: input.guiaTraslado.trim() || null,
        estado: confirmar ? "CONFIRMADO" : existing.estado,
        detalles: {
          create: input.lineas.map((l) => ({
            productoId: l.productoId,
            lote: l.lote.trim(),
            fProduccion: new Date(l.fProduccion),
            fVencimiento: new Date(l.fVencimiento),
            cantidadTotal: l.cantidadTotal,
            unidad: l.unidad,
          })),
        },
      },
    });
  });

  revalidatePath("/ingresos");
  revalidatePath(`/ingresos/${id}`);
  return { id };
}

export async function confirmarIngresoAction(id: string) {
  await requireSession();

  const ingreso = await prisma.ingreso.findUniqueOrThrow({
    where: { id },
    include: { detalles: true },
  });
  if (ingreso.estado === "CONFIRMADO") return;
  if (ingreso.detalles.length === 0) {
    throw new Error("No se puede confirmar un ingreso sin productos.");
  }

  await prisma.ingreso.update({ where: { id }, data: { estado: "CONFIRMADO" } });
  revalidatePath("/ingresos");
  revalidatePath(`/ingresos/${id}`);
}
