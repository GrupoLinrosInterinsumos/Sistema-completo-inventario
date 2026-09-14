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

export type DatosUbicacion = {
  nombreProducto: string;
  rackId: string | null;
  fila: string | null;
  columna: number | null;
  areaLibre: string | null;
  lote: string | null;
  fVencimiento: string | null;
  ordenIngreso: number | null;
};

// Como "Está Vacío" borra de verdad, se guarda todo lo necesario para poder
// recrear la fila tal cual si fue un error — sin esto no habría forma de
// deshacerlo.
export async function eliminarUbicacionAction(id: string): Promise<{ error: string } | { ok: true }> {
  await requireSession();
  await prisma.ubicacionStock.delete({ where: { id } });
  revalidatePath("/ubicacion");
  return { ok: true };
}

export async function restaurarUbicacionAction(
  datos: DatosUbicacion
): Promise<{ error: string } | { id: string }> {
  await requireSession();
  const creado = await prisma.ubicacionStock.create({
    data: {
      nombreProducto: datos.nombreProducto,
      rackId: datos.rackId,
      fila: datos.fila,
      columna: datos.columna,
      areaLibre: datos.areaLibre,
      lote: datos.lote,
      fVencimiento: datos.fVencimiento ? new Date(datos.fVencimiento) : null,
      ordenIngreso: datos.ordenIngreso,
    },
  });
  revalidatePath("/ubicacion");
  return { id: creado.id };
}

export async function moverUbicacionAction(
  id: string,
  formData: FormData
): Promise<{ error: string } | { id: string }> {
  await requireSession();
  const modo = String(formData.get("modo") ?? "rack");

  if (modo === "area") {
    const areaLibre = String(formData.get("areaLibre") ?? "").trim();
    if (!areaLibre) return { error: "Escribe el nombre de la zona (ej. Piso, Gabinete)." };
    await prisma.ubicacionStock.update({
      where: { id },
      data: { areaLibre, rackId: null, fila: null, columna: null },
    });
    revalidatePath("/ubicacion");
    return { id };
  }

  const rackId = String(formData.get("rackId") ?? "").trim();
  const fila = String(formData.get("fila") ?? "").trim().toUpperCase();
  const columna = Number(formData.get("columna"));
  if (!rackId || !fila || !columna) return { error: "Haz clic en una celda del rack de destino." };

  const rack = await prisma.rack.findUnique({ where: { id: rackId } });
  if (!rack) return { error: "Rack no válido." };
  if (fila.length !== 1 || fila < rack.filaMin || fila > rack.filaMax) {
    return { error: `La fila debe estar entre ${rack.filaMin} y ${rack.filaMax} para el Rack ${rack.numero}.` };
  }
  if (columna < 1 || columna > rack.columnas) {
    return { error: `La columna debe estar entre 1 y ${rack.columnas} para el Rack ${rack.numero}.` };
  }

  await prisma.ubicacionStock.update({
    where: { id },
    data: { rackId, fila, columna, areaLibre: null },
  });
  revalidatePath("/ubicacion");
  return { id };
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
