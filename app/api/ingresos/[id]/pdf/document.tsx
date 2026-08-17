import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Almacen, IngresoDetalle, Producto, Usuario } from "@/app/generated/prisma/client";
import { formatFechaLima, formatFechaUTC } from "@/lib/format";

type IngresoParaPdf = {
  nHoja: number;
  fecha: Date;
  guiaTraslado: string | null;
  almacen: Almacen;
  responsable: Usuario;
  detalles: (IngresoDetalle & { producto: Producto })[];
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 14, marginBottom: 10 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  table: { borderWidth: 1, borderColor: "#000000", marginTop: 12 },
  row: { flexDirection: "row" },
  headerCell: {
    backgroundColor: "#e5e7eb",
    fontWeight: 700,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000000",
  },
  cell: {
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000000",
  },
  colN: { flex: 0.4 },
  colProducto: { flex: 2.2 },
  colLote: { flex: 1 },
  colFecha: { flex: 0.9 },
  colCantidad: { flex: 0.9 },
});

export function IngresoPdfDocument({ ingreso }: { ingreso: IngresoParaPdf }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Registro de Ingreso — {ingreso.almacen.nombre}
        </Text>

        <View style={styles.metaRow}>
          <Text>Fecha: {formatFechaLima(ingreso.fecha)}</Text>
          <Text>N° Hoja: {ingreso.nHoja}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text>Responsable: {ingreso.responsable.nombre}</Text>
          <Text>Guía de traslado: {ingreso.guiaTraslado ?? "—"}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.headerCell, styles.colN]}>N°</Text>
            <Text style={[styles.headerCell, styles.colProducto]}>Producto</Text>
            <Text style={[styles.headerCell, styles.colLote]}>Lote</Text>
            <Text style={[styles.headerCell, styles.colFecha]}>F. Prod.</Text>
            <Text style={[styles.headerCell, styles.colFecha]}>F. Venc.</Text>
            <Text style={[styles.headerCell, styles.colCantidad]}>Cantidad</Text>
          </View>

          {ingreso.detalles.map((detalle, index) => (
            <View style={styles.row} key={detalle.id}>
              <Text style={[styles.cell, styles.colN]}>{index + 1}</Text>
              <Text style={[styles.cell, styles.colProducto]}>{detalle.producto.nombreSabor}</Text>
              <Text style={[styles.cell, styles.colLote]}>{detalle.lote}</Text>
              <Text style={[styles.cell, styles.colFecha]}>
                {formatFechaUTC(detalle.fProduccion)}
              </Text>
              <Text style={[styles.cell, styles.colFecha]}>
                {formatFechaUTC(detalle.fVencimiento)}
              </Text>
              <Text style={[styles.cell, styles.colCantidad]}>
                {detalle.cantidadTotal} {detalle.unidad}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
