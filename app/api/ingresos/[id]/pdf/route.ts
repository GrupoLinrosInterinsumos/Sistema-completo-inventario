import { createElement } from "react";
import type { ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { IngresoPdfDocument } from "./document";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ingreso = await prisma.ingreso.findUnique({
    where: { id },
    include: {
      almacen: true,
      responsable: true,
      detalles: { include: { producto: true }, orderBy: { id: "asc" } },
    },
  });

  if (!ingreso) {
    return NextResponse.json({ error: "Ingreso no encontrado." }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    createElement(IngresoPdfDocument, { ingreso }) as ReactElement<DocumentProps>
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="ingreso-${ingreso.almacen.nombre}-${ingreso.nHoja}.pdf"`,
    },
  });
}
