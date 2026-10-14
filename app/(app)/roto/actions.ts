"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { esMotivoDano } from "@/lib/roto";
import { esZonaFija } from "@/lib/ubicaciones-fijas";

export type RotoFormState = { error?: string } | undefined;

async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("No autorizado.");
  return session;
}

async function ubicacionValida(ubicacion: string) {
  if (esZonaFija(ubicacion)) return true;
  const m = /^Rack (\d+)$/.exec(ubicacion);
  if (!m) return false;
  const rack = await prisma.rack.findUnique({ where: { numero: Number(m[1]) } });
  return !!rack;
}

export async function crearProductoDanadoAction(
  _prevState: RotoFormState,
  formData: FormData
): Promise<RotoFormState> {
  const session = await requireSession();

  const nombreProducto = String(formData.get("nombreProducto") ?? "").trim();
  const motivo = String(formData.get("motivo") ?? "");
  const lote = String(formData.get("lote") ?? "").trim();
  const cantidad = Number(formData.get("cantidad"));
  const unidad = String(formData.get("unidad") ?? "kg").trim();
  const ubicacion = String(formData.get("ubicacion") ?? "").trim();
  const paleta = String(formData.get("paleta") ?? "").trim();
  const observacion = String(formData.get("observacion") ?? "").trim();

  if (!nombreProducto) return { error: "Completa el nombre del producto." };
  if (!esMotivoDano(motivo)) return { error: "Selecciona un motivo." };
  if (!(cantidad > 0)) return { error: "La cantidad debe ser mayor a 0." };
  if (!(await ubicacionValida(ubicacion))) return { error: "Elige una ubicación de la lista." };

  const creado = await prisma.productoDanado.create({
    data: {
      nombreProducto,
      motivo,
      lote: lote || null,
      cantidad,
      unidad: unidad || "kg",
      ubicacion,
      paleta: paleta || null,
      observacion: observacion || null,
      usuarioId: session.user.id,
    },
  });

  revalidatePath("/roto");
  redirect(`/roto?creado=${creado.id}`);
}

export type DescuentoResult = { error: string } | { ok: true };

// Descuenta lo que se va consumiendo: baja la cantidad disponible y guarda
// quién y cuándo, para poder ver el historial.
export async function descontarProductoDanadoAction(
  id: string,
  cantidad: number,
  observacion: string
): Promise<DescuentoResult> {
  const session = await requireSession();
  if (!(cantidad > 0)) return { error: "La cantidad a descontar debe ser mayor a 0." };

  const resultado = await prisma.$transaction(async (tx) => {
    const fila = await tx.productoDanado.findUnique({ where: { id } });
    if (!fila) return { error: "El registro ya no existe." } as const;
    if (cantidad > fila.cantidad + 1e-9) {
      return { error: `No puedes descontar más de lo disponible (${fila.cantidad} ${fila.unidad}).` } as const;
    }
    await tx.productoDanado.update({ where: { id }, data: { cantidad: { decrement: cantidad } } });
    await tx.consumoDanado.create({
      data: { productoDanadoId: id, cantidad, observacion: observacion.trim() || null, usuarioId: session.user.id },
    });
    return { ok: true } as const;
  });

  if ("error" in resultado) return resultado;
  revalidatePath("/roto");
  return resultado;
}
