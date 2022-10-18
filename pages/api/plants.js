// This is the API for plantas_en_desarrollo table.
import omit from 'lodash.omit'
import { getKnex } from '../../knex'

export default async function handler (req, res) {
  const { method, body } = req
  if (!(['GET', 'POST', 'PATCH'].includes(method))) {
    return res.status(405).json({
      error: true,
      message: 'Method Not Allowed'
    })
  }

  if (['PATCH'].includes(method) && !body) {
    return res.status(400).json({ error: true, reason: 'Bad Request' })
  }

  const knex = getKnex('sd_plantas')

  try {
    let data = []
    if (method === 'GET') {
      data = await knex('plantas_en_desarrollo').join('plantas', { 'plantas.id': 'plantas_en_desarrollo.Planta' })
        .select([
          'plantas_en_desarrollo.id', 'plantas_en_desarrollo.Estado vivero', 'plantas_en_desarrollo.Cantidad', 'plantas_en_desarrollo.Fecha transplante', 'plantas_en_desarrollo.Fecha de entrega', 'plantas.Planta', 'plantas.Tipo', 'plantas.Contenedor'
        ])
    }

    if (method === 'POST') {
      console.log(req.body)
      await knex.insert([req.body]).into('plantas_en_desarrollo')
    }

    if (method === 'PATCH') {
      const { id } = body
      const update = omit(body, 'id')
      await knex('plantas_en_desarrollo')
        .where('id', '=', id)
        .update(update)
      data = await knex('plantas_en_desarrollo').join('plantas', { 'plantas.id': 'plantas_en_desarrollo.Planta' })
        .select([
          'plantas_en_desarrollo.id', 'plantas_en_desarrollo.Estado vivero', 'plantas_en_desarrollo.Cantidad', 'plantas_en_desarrollo.Fecha transplante', 'plantas_en_desarrollo.Fecha de entrega', 'plantas.Planta', 'plantas.Tipo', 'plantas.Contenedor'
        ])
    }
    await knex.destroy()
    return res.status(200).json(data)
  } catch (error) {
    await knex.destroy()
    console.log(error)
    return res.status(500).json(error)
  }
}
