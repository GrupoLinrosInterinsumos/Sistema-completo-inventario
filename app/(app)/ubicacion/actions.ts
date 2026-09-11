"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type UbicacionFormState = { error?: string } | undefined;

async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("No autorizado.");
  return session;
}

export async function crearUbicacionStockAction(
  _prevState: UbicacionFormState,
  formData: FormData
): Promise<UbicacionFormState> {
  await requireSession();

  const nombreProducto = String(formData.get("nombreProducto") ?? "").trim();
  const modo = String(formData.get("modo") ?? "rack");
  const lote = String(formData.get("lote") ?? "").trim();
  const fVencimientoRaw = String(formData.get("fVencimiento") ?? "").trim();

  if (!nombreProducto || !lote || !fVencimientoRaw) {
    return { error: "Completa todos los campos." };
  }
  const fVencimiento = new Date(fVencimientoRaw);
  if (Number.isNaN(fVencimiento.getTime())) {
    return { error: "La fecha de vencimiento no es válida." };
  }

  if (modo === "area") {
    const areaLibre = String(formData.get("areaLibre") ?? "").trim();
    if (!areaLibre) return { error: "Escribe el nombre de la zona (ej. Piso, Gabinete)." };

    const creado = await prisma.ubicacionStock.create({
      data: { nombreProducto, areaLibre, lote, fVencimiento },
    });
    revalidatePath("/ubicacion");
    redirect(`/ubicacion/${creado.id}`);
  }

  const rackId = String(formData.get("rackId") ?? "").trim();
  const celdasRaw = String(formData.get("celdas") ?? "");

  if (!rackId || !celdasRaw) {
    return { error: "Completa todos los campos." };
  }

  let celdas: { fila: string; columna: number }[];
  try {
    celdas = JSON.parse(celdasRaw);
  } catch {
    return { error: "Selección de celdas inválida." };
  }
  if (!Array.isArray(celdas) || celdas.length === 0) {
    return { error: "Haz clic en al menos una celda del rack." };
  }

  const rack = await prisma.rack.findUnique({ where: { id: rackId } });
  if (!rack) return { error: "Rack no válido." };

  for (const c of celdas) {
    const fila = String(c.fila ?? "").toUpperCase();
    const columna = Number(c.columna);
    if (fila.length !== 1 || fila < rack.filaMin || fila > rack.filaMax) {
      return { error: `La fila debe estar entre ${rack.filaMin} y ${rack.filaMax} para el Rack ${rack.numero}.` };
    }
    if (!columna || columna < 1 || columna > rack.columnas) {
      return { error: `La columna debe estar entre 1 y ${rack.columnas} para el Rack ${rack.numero}.` };
    }
  }

  await prisma.ubicacionStock.createMany({
    data: celdas.map((c) => ({
      nombreProducto,
      rackId,
      fila: String(c.fila).toUpperCase(),
      columna: Number(c.columna),
      lote,
      fVencimiento,
    })),
  });

  revalidatePath("/ubicacion");
  redirect(`/ubicacion?q=${encodeURIComponent(nombreProducto)}`);
}

export async function marcarVacioAction(id: string, volverHref: string) {
  await requireSession();
  await prisma.ubicacionStock.delete({ where: { id } });
  revalidatePath("/ubicacion");
  redirect(volverHref);
}

export async function marcarVaciosAction(
  ids: string[]
): Promise<{ error: string } | { ok: true; cantidad: number }> {
  await requireSession();
  if (ids.length === 0) return { error: "No seleccionaste ninguna ubicación." };
  await prisma.ubicacionStock.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/ubicacion");
  return { ok: true, cantidad: ids.length };
}
