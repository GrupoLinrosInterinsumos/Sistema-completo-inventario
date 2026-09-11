-- AlterTable
ALTER TABLE "UbicacionStock" ADD COLUMN     "fVencimiento" TIMESTAMP(3),
ADD COLUMN     "lote" TEXT,
ALTER COLUMN "ordenIngreso" DROP NOT NULL;
