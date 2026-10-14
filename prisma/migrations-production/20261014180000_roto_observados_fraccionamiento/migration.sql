-- AlterEnum
ALTER TYPE "NombreAlmacen" ADD VALUE 'FRACCIONAMIENTO';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MotivoDano" ADD VALUE 'OBSERVADO';
ALTER TYPE "MotivoDano" ADD VALUE 'MATERIAL';

-- AlterTable
ALTER TABLE "ProductoDanado" ADD COLUMN     "lote" TEXT,
ADD COLUMN     "paleta" TEXT;

-- CreateTable
CREATE TABLE "ConsumoDanado" (
    "id" TEXT NOT NULL,
    "productoDanadoId" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "observacion" TEXT,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsumoDanado_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConsumoDanado" ADD CONSTRAINT "ConsumoDanado_productoDanadoId_fkey" FOREIGN KEY ("productoDanadoId") REFERENCES "ProductoDanado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoDanado" ADD CONSTRAINT "ConsumoDanado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

