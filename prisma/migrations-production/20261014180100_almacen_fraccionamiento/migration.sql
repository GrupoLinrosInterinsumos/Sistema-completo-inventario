-- Va en una migración aparte porque en Postgres un valor de enum recién
-- agregado no se puede usar dentro de la misma transacción que lo creó.
INSERT INTO "Almacen" ("id", "nombre", "tipoUbicacion", "contadorFolio")
VALUES ('almacen_fraccionamiento', 'FRACCIONAMIENTO', 'PALETA', 0)
ON CONFLICT ("nombre") DO NOTHING;
