import { getKnex } from '../../knex'

const rawQuery = `
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
    AND (ue."Contenedor" = ul."Contenedor" OR ue."Contenedor" IS NULL AND ul."Contenedor" IS NULL)
    WHERE (ul. "Unidades listas para entrega" - ue. "Unidades entregadas") > 0;
`

export default async function handler (req, res) {
  const { method, query } = req
  if (!(['GET'].includes(method))) {
    return res.status(405).json({
      error: true,
      message: 'Method Not Allowed'
    })
  }

  const knex = getKnex('sd_plantas')

  try {
    let data = []
    if (!query.filter) {
      data = await knex('inventario').where('Inventario', '>', 0)
    } else {
      const rawResult = await knex.raw(rawQuery, [query.filter])
      data = rawResult.rows
    }

    await knex.destroy()
    return res.status(200).json(data)
  } catch (error) {
    await knex.destroy()
    console.log(error)
    return res.status(500).json(error)
  }
}
