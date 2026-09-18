"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseFechaISO, validarFechasIngreso } from "@/lib/fechas";
import { Prisma } from "@/app/generated/prisma/client";

export type LineaInput = {
  // Solo al editar: la línea ya existente en la base. `tieneDesglose` solo
  // le sirve a la pantalla para bloquear campos; el servidor lo recalcula.
  id?: string;
  tieneDesglose?: boolean;
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
  for (const [i, linea] of input.lineas.entries()) {
    const prefijo = `Línea ${i + 1}: `;
    if (!linea.productoId) return `${prefijo}falta el producto.`;
    if (!linea.lote.trim()) return `${prefijo}falta el lote.`;
    if (!linea.fProduccion || !linea.fVencimiento) {
      return `${prefijo}faltan las fechas de producción y de vencimiento.`;
    }
    const errorFechas = validarFechasIngreso(linea.fProduccion, linea.fVencimiento);
    if (errorFechas) return `${prefijo}${errorFechas}`;
    if (!(linea.cantidadTotal > 0)) return `${prefijo}la cantidad debe ser mayor a 0.`;
    if (!linea.unidad) return `${prefijo}selecciona la unidad (kg o cajas).`;
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
            fProduccion: parseFechaISO(l.fProduccion)!,
            fVencimiento: parseFechaISO(l.fVencimiento)!,
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

  const existing = await prisma.ingreso.findUniqueOrThrow({
    where: { id },
    include: { detalles: { include: { desgloses: true, producto: true } } },
  });
  if (existing.estado === "CONFIRMADO" && session.user.rol !== "SUPERVISOR") {
    return { error: "Solo un supervisor puede editar un ingreso ya confirmado." };
  }

  const error = validar(input);
  if (error) return { error };

  const detallePorId = new Map(existing.detalles.map((d) => [d.id, d]));
  const idsEnviados = new Set(input.lineas.map((l) => l.id).filter((x): x is string => !!x));

  for (const d of existing.detalles) {
    if (!idsEnviados.has(d.id) && d.desgloses.length > 0) {
      return {
        error: `No puedes quitar "${d.producto.nombreSabor}" (lote ${d.lote}) porque ya tiene desglose por paletas/cajas.`,
      };
    }
  }

  for (const l of input.lineas) {
    if (!l.id) continue;
    const d = detallePorId.get(l.id);
    if (!d) return { error: "Una de las líneas ya no existe. Recarga la página e inténtalo de nuevo." };
    const cambioMasQueFechas =
      l.productoId !== d.productoId ||
      l.lote.trim() !== d.lote ||
      l.cantidadTotal !== d.cantidadTotal ||
      l.unidad !== d.unidad;
    if (d.desgloses.length > 0 && cambioMasQueFechas) {
      return {
        error: `"${d.producto.nombreSabor}" (lote ${d.lote}) ya tiene desglose: solo se pueden corregir sus fechas de producción y vencimiento.`,
      };
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const d of existing.detalles) {
      if (!idsEnviados.has(d.id)) await tx.ingresoDetalle.delete({ where: { id: d.id } });
    }

    for (const l of input.lineas) {
      const fProduccion = parseFechaISO(l.fProduccion)!;
      const fVencimiento = parseFechaISO(l.fVencimiento)!;

      if (!l.id) {
        await tx.ingresoDetalle.create({
          data: {
            ingresoId: id,
            productoId: l.productoId,
            lote: l.lote.trim(),
            fProduccion,
            fVencimiento,
            cantidadTotal: l.cantidadTotal,
            unidad: l.unidad,
          },
        });
        continue;
      }

      const d = detallePorId.get(l.id)!;
      if (d.desgloses.length === 0) {
        await tx.ingresoDetalle.update({
          where: { id: d.id },
          data: {
            productoId: l.productoId,
            lote: l.lote.trim(),
            fProduccion,
            fVencimiento,
            cantidadTotal: l.cantidadTotal,
            unidad: l.unidad,
          },
        });
        continue;
      }

      // Con desglose ya hecho: se corrigen las fechas en la ficha, en el
      // desglose y en el stock vivo que salió de ese desglose, para que
      // Buscar/Retirar stock deje de mostrar la fecha equivocada.
      await tx.ingresoDetalle.update({ where: { id: d.id }, data: { fProduccion, fVencimiento } });
      await tx.inventarioDesglose.updateMany({
        where: { ingresoDetalleId: d.id },
        data: { fProduccion, fVencimiento },
      });
      for (const dg of d.desgloses.filter((x) => x.subidoAStock)) {
        await tx.inventarioActual.updateMany({
          where: {
            productoId: dg.productoId,
            almacenId: existing.almacenId,
            ubicacionNumero: dg.ubicacionNumero,
            nCaja: dg.nCaja,
            lote: dg.lote,
          },
          data: { fProduccion, fVencimiento },
        });
      }
    }

    await tx.ingreso.update({
      where: { id },
      data: {
        guiaTraslado: input.guiaTraslado.trim() || null,
        estado: confirmar && existing.estado === "BORRADOR" ? "CONFIRMADO" : existing.estado,
      },
    });
  });

  revalidatePath("/ingresos");
  revalidatePath(`/ingresos/${id}`);
  revalidatePath("/inventario");
  revalidatePath(`/inventario/${id}`);
  revalidatePath("/stock");
  revalidatePath("/stock/buscar");
  return { id };
}

export type NuevoProductoResult =
  | { error: string }
  | { producto: { id: string; nombreSabor: string; codigo: string; presentacion: string; almacenId: string } };

// Crear un producto al vuelo desde "Nuevo ingreso" cuando todavía no existe
// en el catálogo — cualquier usuario autenticado puede usarlo (a diferencia
// del catálogo en /productos, que es solo para el supervisor).
export async function crearProductoRapidoAction(
  almacenId: string,
  nombreSabor: string,
  codigo: string,
  presentacion: string
): Promise<NuevoProductoResult> {
  await requireSession();

  const nombre = nombreSabor.trim();
  const cod = codigo.trim();
  const presen = presentacion.trim();

  if (!almacenId || !nombre || !cod || !presen) {
    return { error: "Completa nombre, código y presentación." };
  }

  try {
    const producto = await prisma.producto.create({
      data: { nombreSabor: nombre, codigo: cod, presentacion: presen, almacenId },
    });
    revalidatePath("/ingresos/nuevo");
    return { producto };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Ya existe un producto con ese código." };
    }
    throw e;
  }
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
