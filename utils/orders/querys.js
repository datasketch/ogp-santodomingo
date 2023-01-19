export const rawUntilQuery = `
SELECT
    ue."Planta",
    ue."Tipo",
    ue."Contenedor",
    ul."Unidades listas para entrega",
    ue."Unidades entregadas",
    (ul."Unidades listas para entrega" - ue."Unidades entregadas") "Inventario"
FROM
    (
        SELECT
            pl."Planta",
            pl."Tipo",
            pl."Contenedor",
            SUM(
                CASE
                    WHEN dp."Cantidad" IS NOT NULL THEN dp."Cantidad"
                    ELSE 0
                END
            ) AS "Unidades entregadas"
        FROM plantas pl
        FULL JOIN detalle_pedidos dp ON pl.id = dp."Planta"
        FULL JOIN pedidos p ON dp."Pedido" = p.id
        GROUP BY
            pl."Planta",
            pl."Tipo",
            pl."Contenedor"
        ORDER BY
            pl."Planta"
    ) ue
JOIN
    (
        SELECT
            p."Planta",
            p."Tipo",
            p."Contenedor",
            SUM(
                CASE
                    WHEN ped."Estado vivero" = 'Lista para entrega' THEN
                        CASE
                            WHEN ped."Fecha de entrega" <= ? THEN ped."Cantidad"
                            ELSE 0
                        END
                    ELSE 0
                END
            ) AS "Unidades listas para entrega"
        FROM plantas p
        FULL JOIN plantas_en_desarrollo ped ON p.id = ped."Planta"
        GROUP BY
            p."Planta",
            p."Tipo",
            p."Contenedor"
        ORDER BY
            p."Planta"
    ) ul
    ON (ue."Planta" = ul."Planta" OR ue."Planta" IS NULL AND ul."Planta" IS NULL)
    AND (ue."Tipo" = ul."Tipo" OR ue."Tipo" IS NULL AND ul."Tipo" IS NULL)
    AND (ue."Contenedor" = ul."Contenedor" OR ue."Contenedor" IS NULL AND ul."Contenedor" IS NULL);
`

export const rawSinceQuery = `
SELECT
    ue."Planta",
    ue."Tipo",
    ue."Contenedor",
    ul."Unidades listas para entrega",
    ue."Unidades entregadas",
    (ul."Unidades listas para entrega" - ue."Unidades entregadas") "Inventario"
FROM
    (
        SELECT
            pl."Planta",
            pl."Tipo",
            pl."Contenedor",
            SUM(
                CASE
                    WHEN dp."Cantidad" IS NOT NULL THEN dp."Cantidad"
                    ELSE 0
                END
            ) AS "Unidades entregadas"
        FROM plantas pl
        FULL JOIN detalle_pedidos dp ON pl.id = dp."Planta"
        FULL JOIN pedidos p ON dp."Pedido" = p.id
        GROUP BY
            pl."Planta",
            pl."Tipo",
            pl."Contenedor"
        ORDER BY
            pl."Planta"
    ) ue
JOIN
    (
        SELECT
            p."Planta",
            p."Tipo",
            p."Contenedor",
            SUM(
                CASE
                    WHEN ped."Estado vivero" = 'Lista para entrega' THEN
                        CASE
                            WHEN ped."Fecha de entrega" >= ? THEN ped."Cantidad"
                            ELSE 0
                        END
                    ELSE 0
                END
            ) AS "Unidades listas para entrega"
        FROM plantas p
        FULL JOIN plantas_en_desarrollo ped ON p.id = ped."Planta"
        GROUP BY
            p."Planta",
            p."Tipo",
            p."Contenedor"
        ORDER BY
            p."Planta"
    ) ul
    ON (ue."Planta" = ul."Planta" OR ue."Planta" IS NULL AND ul."Planta" IS NULL)
    AND (ue."Tipo" = ul."Tipo" OR ue."Tipo" IS NULL AND ul."Tipo" IS NULL)
    AND (ue."Contenedor" = ul."Contenedor" OR ue."Contenedor" IS NULL AND ul."Contenedor" IS NULL);
`

export const rawQuery = `
SELECT
    ue."Planta",
    ue."Tipo",
    ue."Contenedor",
    ul."Unidades listas para entrega",
    ue."Unidades entregadas",
    (ul."Unidades listas para entrega" - ue."Unidades entregadas") "Inventario"
FROM
    (
        SELECT
            pl."Planta",
            pl."Tipo",
            pl."Contenedor",
            SUM(
                CASE
                    WHEN dp."Cantidad" IS NOT NULL THEN dp."Cantidad"
                    ELSE 0
                END
            ) AS "Unidades entregadas"
        FROM plantas pl
        FULL JOIN detalle_pedidos dp ON pl.id = dp."Planta"
        FULL JOIN pedidos p ON dp."Pedido" = p.id
        GROUP BY
            pl."Planta",
            pl."Tipo",
            pl."Contenedor"
        ORDER BY
            pl."Planta"
    ) ue
JOIN
    (
        SELECT
            p."Planta",
            p."Tipo",
            p."Contenedor",
            SUM(
                CASE
                    WHEN ped."Estado vivero" = 'Lista para entrega' THEN
                        CASE
                            WHEN ped."Fecha de entrega" >= ? AND ped."Fecha de entrega" <= ? THEN ped."Cantidad"
                            ELSE 0
                        END
                    ELSE 0
                END
            ) AS "Unidades listas para entrega"
        FROM plantas p
        FULL JOIN plantas_en_desarrollo ped ON p.id = ped."Planta"
        GROUP BY
            p."Planta",
            p."Tipo",
            p."Contenedor"
        ORDER BY
            p."Planta"
    ) ul
    ON (ue."Planta" = ul."Planta" OR ue."Planta" IS NULL AND ul."Planta" IS NULL)
    AND (ue."Tipo" = ul."Tipo" OR ue."Tipo" IS NULL AND ul."Tipo" IS NULL)
    AND (ue."Contenedor" = ul."Contenedor" OR ue."Contenedor" IS NULL AND ul."Contenedor" IS NULL);
`
