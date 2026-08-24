-- DropIndex
DROP INDEX "UbicacionStock_rackId_fila_columna_key";

-- CreateIndex
CREATE INDEX "UbicacionStock_rackId_fila_columna_idx" ON "UbicacionStock"("rackId", "fila", "columna");
