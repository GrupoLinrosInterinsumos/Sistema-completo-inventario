-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InventarioDesglose" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ingresoDetalleId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "lote" TEXT NOT NULL,
    "fProduccion" DATETIME NOT NULL,
    "fVencimiento" DATETIME NOT NULL,
    "ubicacionNumero" TEXT NOT NULL,
    "nCaja" TEXT NOT NULL,
    "cantidadKg" REAL NOT NULL,
    "subidoAStock" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventarioDesglose_ingresoDetalleId_fkey" FOREIGN KEY ("ingresoDetalleId") REFERENCES "IngresoDetalle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventarioDesglose_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InventarioDesglose" ("cantidadKg", "createdAt", "fProduccion", "fVencimiento", "id", "ingresoDetalleId", "lote", "nCaja", "productoId", "ubicacionNumero") SELECT "cantidadKg", "createdAt", "fProduccion", "fVencimiento", "id", "ingresoDetalleId", "lote", "nCaja", "productoId", "ubicacionNumero" FROM "InventarioDesglose";
DROP TABLE "InventarioDesglose";
ALTER TABLE "new_InventarioDesglose" RENAME TO "InventarioDesglose";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
