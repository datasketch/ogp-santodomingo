import { getKnex } from '../../knex'
import { rawQuery, rawSinceQuery, rawUntilQuery } from '../../utils/orders/querys'

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
    const { since, until } = query
    if (!since && !until) {
      data = await knex('inventario').where('Inventario', '>', 0)
    }
    if (since && !until) {
      const rawResult = await knex.raw(rawSinceQuery, [since])
      data = rawResult.rows.filter(row => +row.Inventario > 0)
    }
    if (!since && until) {
      const rawResult = await knex.raw(rawUntilQuery, [until])
      data = rawResult.rows.filter(row => +row.Inventario > 0)
    }
    if (since && until) {
      const rawResult = await knex.raw(rawQuery, [since, until])
      data = rawResult.rows.filter(row => +row.Inventario > 0)
    }
    await knex.destroy()
    return res.status(200).json(data)
  } catch (error) {
    await knex.destroy()
    console.log(error)
    return res.status(500).json(error)
  }
}
