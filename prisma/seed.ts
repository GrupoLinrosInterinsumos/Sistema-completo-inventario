import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.almacen.upsert({
    where: { nombre: "CRAMER" },
    update: {},
    create: { nombre: "CRAMER", tipoUbicacion: "PALETA" },
  });

  await prisma.almacen.upsert({
    where: { nombre: "SACCO" },
    update: {},
    create: { nombre: "SACCO", tipoUbicacion: "SLOT" },
  });

  const email = "admin@gli.pe";
  const passwordHash = await bcrypt.hash("Almacen2026!", 10);

  await prisma.usuario.upsert({
    where: { email },
    update: {},
    create: {
      nombre: "Administrador",
      email,
      passwordHash,
      rol: "SUPERVISOR",
      activo: true,
    },
  });

  const racks = [
    { numero: 1, filaMin: "A", filaMax: "D", columnas: 21 },
    { numero: 2, filaMin: "A", filaMax: "E", columnas: 20 },
    { numero: 3, filaMin: "A", filaMax: "E", columnas: 20 },
    { numero: 4, filaMin: "A", filaMax: "E", columnas: 20 },
    { numero: 5, filaMin: "A", filaMax: "E", columnas: 20 },
    { numero: 6, filaMin: "A", filaMax: "E", columnas: 20 },
    { numero: 7, filaMin: "A", filaMax: "E", columnas: 20 },
  ];

  for (const rack of racks) {
    await prisma.rack.upsert({
      where: { numero: rack.numero },
      update: { filaMin: rack.filaMin, filaMax: rack.filaMax, columnas: rack.columnas },
      create: rack,
    });
  }

  console.log("Seed completado.");
  console.log(`Usuario supervisor inicial: ${email} / Almacen2026!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
