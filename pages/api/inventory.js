import { format } from 'date-fns'
import { getKnex } from '../../knex'
import { rawQuery } from '../../utils/orders/querys'

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
    } else {
      const desde = since || format(new Date(null), 'yyyy-MM-dd')
      const hasta = until || format(new Date(), 'yyyy-MM-dd')
      const rawResult = await knex.raw(rawQuery, [desde, hasta])
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
