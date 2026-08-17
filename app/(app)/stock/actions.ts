"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type RetiroActionResult = { error: string } | { ok: true };

async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("No autorizado.");
  return session;
}

export async function retirarStockAction(
  inventarioActualId: string,
  cantidad: number,
  motivo: string
): Promise<RetiroActionResult> {
  const session = await requireSession();

  if (!(cantidad > 0)) return { error: "La cantidad a retirar debe ser mayor a 0." };

  const fila = await prisma.inventarioActual.findUniqueOrThrow({
    where: { id: inventarioActualId },
  });

  if (cantidad > fila.cantidadDisponible + 1e-9) {
    return { error: `No puedes retirar más de lo disponible (${fila.cantidadDisponible}).` };
  }

  await prisma.$transaction(async (tx) => {
    await tx.inventarioActual.update({
      where: { id: inventarioActualId },
      data: { cantidadDisponible: { decrement: cantidad } },
    });

    await tx.movimiento.create({
      data: {
        tipo: "SALIDA",
        inventarioActualId,
        productoId: fila.productoId,
        cantidad,
        usuarioId: session.user.id,
        observacion: motivo.trim() || null,
      },
    });
  });

  revalidatePath("/stock");
  revalidatePath("/stock/buscar");
  revalidatePath("/dashboard");
  return { ok: true };
}
