-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ALMACEN', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "NombreAlmacen" AS ENUM ('CRAMER', 'SACCO');

-- CreateEnum
CREATE TYPE "TipoUbicacion" AS ENUM ('PALETA', 'SLOT');

-- CreateEnum
CREATE TYPE "EstadoIngreso" AS ENUM ('BORRADOR', 'DESGLOSADO', 'CONFIRMADO');

-- CreateEnum
CREATE TYPE "EstadoDesglose" AS ENUM ('PENDIENTE', 'PARCIAL', 'COMPLETO');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('INGRESO', 'SALIDA', 'AJUSTE', 'ANULACION');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Almacen" (
    "id" TEXT NOT NULL,
    "nombre" "NombreAlmacen" NOT NULL,
    "tipoUbicacion" "TipoUbicacion" NOT NULL,
    "contadorFolio" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Almacen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "nombreSabor" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "presentacion" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingreso" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nHoja" INTEGER NOT NULL,
    "almacenId" TEXT NOT NULL,
    "responsableId" TEXT NOT NULL,
    "guiaTraslado" TEXT,
    "estado" "EstadoIngreso" NOT NULL DEFAULT 'BORRADOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ingreso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngresoDetalle" (
    "id" TEXT NOT NULL,
    "ingresoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "lote" TEXT NOT NULL,
    "fProduccion" TIMESTAMP(3) NOT NULL,
    "fVencimiento" TIMESTAMP(3) NOT NULL,
    "cantidadTotal" DOUBLE PRECISION NOT NULL,
    "unidad" TEXT NOT NULL,
    "estadoDesglose" "EstadoDesglose" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "IngresoDetalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventarioDesglose" (
    "id" TEXT NOT NULL,
    "ingresoDetalleId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "lote" TEXT NOT NULL,
    "fProduccion" TIMESTAMP(3) NOT NULL,
    "fVencimiento" TIMESTAMP(3) NOT NULL,
    "ubicacionNumero" TEXT NOT NULL,
    "nCaja" TEXT NOT NULL,
    "cantidadKg" DOUBLE PRECISION NOT NULL,
    "subidoAStock" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventarioDesglose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventarioActual" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "ubicacionNumero" TEXT NOT NULL,
    "nCaja" TEXT NOT NULL,
    "lote" TEXT NOT NULL,
    "fProduccion" TIMESTAMP(3) NOT NULL,
    "fVencimiento" TIMESTAMP(3) NOT NULL,
    "cantidadDisponible" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "InventarioActual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimiento" (
    "id" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "inventarioActualId" TEXT,
    "productoId" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referencia" TEXT,
    "observacion" TEXT,

    CONSTRAINT "Movimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rack" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "filaMin" TEXT NOT NULL,
    "filaMax" TEXT NOT NULL,
    "columnas" INTEGER NOT NULL,

    CONSTRAINT "Rack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UbicacionStock" (
    "id" TEXT NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "rackId" TEXT NOT NULL,
    "fila" TEXT NOT NULL,
    "columna" INTEGER NOT NULL,
    "ordenIngreso" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UbicacionStock_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "InventarioActual_productoId_almacenId_ubicacionNumero_nCaja_key" ON "InventarioActual"("productoId", "almacenId", "ubicacionNumero", "nCaja", "lote");

-- CreateIndex
CREATE UNIQUE INDEX "Rack_numero_key" ON "Rack"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "UbicacionStock_rackId_fila_columna_key" ON "UbicacionStock"("rackId", "fila", "columna");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingreso" ADD CONSTRAINT "Ingreso_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingreso" ADD CONSTRAINT "Ingreso_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngresoDetalle" ADD CONSTRAINT "IngresoDetalle_ingresoId_fkey" FOREIGN KEY ("ingresoId") REFERENCES "Ingreso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngresoDetalle" ADD CONSTRAINT "IngresoDetalle_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioDesglose" ADD CONSTRAINT "InventarioDesglose_ingresoDetalleId_fkey" FOREIGN KEY ("ingresoDetalleId") REFERENCES "IngresoDetalle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioDesglose" ADD CONSTRAINT "InventarioDesglose_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioActual" ADD CONSTRAINT "InventarioActual_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioActual" ADD CONSTRAINT "InventarioActual_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_inventarioActualId_fkey" FOREIGN KEY ("inventarioActualId") REFERENCES "InventarioActual"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UbicacionStock" ADD CONSTRAINT "UbicacionStock_rackId_fkey" FOREIGN KEY ("rackId") REFERENCES "Rack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
