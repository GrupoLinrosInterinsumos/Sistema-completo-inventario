-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Almacen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "tipoUbicacion" TEXT NOT NULL,
    "contadorFolio" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombreSabor" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "presentacion" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Ingreso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nHoja" INTEGER NOT NULL,
    "almacenId" TEXT NOT NULL,
    "responsableId" TEXT NOT NULL,
    "guiaTraslado" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ingreso_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ingreso_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IngresoDetalle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ingresoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "lote" TEXT NOT NULL,
    "fProduccion" DATETIME NOT NULL,
    "fVencimiento" DATETIME NOT NULL,
    "cantidadTotal" REAL NOT NULL,
    "unidad" TEXT NOT NULL,
    "estadoDesglose" TEXT NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT "IngresoDetalle_ingresoId_fkey" FOREIGN KEY ("ingresoId") REFERENCES "Ingreso" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "IngresoDetalle_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventarioDesglose" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ingresoDetalleId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "lote" TEXT NOT NULL,
    "fProduccion" DATETIME NOT NULL,
    "fVencimiento" DATETIME NOT NULL,
    "ubicacionNumero" TEXT NOT NULL,
    "nCaja" TEXT NOT NULL,
    "cantidadKg" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventarioDesglose_ingresoDetalleId_fkey" FOREIGN KEY ("ingresoDetalleId") REFERENCES "IngresoDetalle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventarioDesglose_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventarioActual" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productoId" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "ubicacionNumero" TEXT NOT NULL,
    "nCaja" TEXT NOT NULL,
    "lote" TEXT NOT NULL,
    "fProduccion" DATETIME NOT NULL,
    "fVencimiento" DATETIME NOT NULL,
    "cantidadDisponible" REAL NOT NULL,
    CONSTRAINT "InventarioActual_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventarioActual_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Movimiento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "inventarioActualId" TEXT,
    "productoId" TEXT NOT NULL,
    "cantidad" REAL NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fechaHora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referencia" TEXT,
    "observacion" TEXT,
    CONSTRAINT "Movimiento_inventarioActualId_fkey" FOREIGN KEY ("inventarioActualId") REFERENCES "InventarioActual" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Movimiento_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Movimiento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Almacen_nombre_key" ON "Almacen"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigo_key" ON "Producto"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Ingreso_almacenId_nHoja_key" ON "Ingreso"("almacenId", "nHoja");

-- CreateIndex
CREATE UNIQUE INDEX "InventarioActual_productoId_almacenId_ubicacionNumero_nCaja_lote_key" ON "InventarioActual"("productoId", "almacenId", "ubicacionNumero", "nCaja", "lote");
