import { getKnex } from '../../knex'

export default async function handler (req, res) {
  const { method } = req
  if (!(['GET'].includes(method))) {
    return res.status(405).json({
      error: true,
      message: 'Method Not Allowed'
    })
  }

  const knex = getKnex('sd_plantas')

  try {
    let data = []
    if (method === 'GET') {
      data = await knex.raw(`SELECT
      ue. "Planta",
      ue. "Tipo",
      ue. "Contenedor",
      ul. "Unidades listas para entrega",
      ue. "Unidades entregadas",
      (ul. "Unidades listas para entrega" - ue. "Unidades entregadas") "Inventario"
    FROM
      unidades_entregadas ue
      JOIN unidades_listas_para_entrega ul ON (ue. "Planta" = ul. "Planta"
          OR ue. "Planta" IS NULL
          AND ul. "Planta" IS NULL)
        AND(ue. "Tipo" = ul. "Tipo"
          OR ue. "Tipo" IS NULL
          AND ul. "Tipo" IS NULL)
        AND(ue. "Contenedor" = ul. "Contenedor"
          OR ue. "Contenedor" IS NULL
          AND ul. "Contenedor" IS NULL);`)
      data = data.rows
    }

    await knex.destroy()
    return res.status(200).json(data)
  } catch (error) {
    await knex.destroy()
    console.log(error)
    return res.status(500).json(error)
  }
}
