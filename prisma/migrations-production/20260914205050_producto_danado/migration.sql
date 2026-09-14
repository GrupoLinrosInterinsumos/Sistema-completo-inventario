-- CreateEnum
CREATE TYPE "MotivoDano" AS ENUM ('ROTO', 'NC');

-- CreateTable
CREATE TABLE "ProductoDanado" (
    "id" TEXT NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "motivo" "MotivoDano" NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "unidad" TEXT NOT NULL DEFAULT 'kg',
    "ubicacion" TEXT NOT NULL,
    "observacion" TEXT,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductoDanado_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductoDanado" ADD CONSTRAINT "ProductoDanado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
