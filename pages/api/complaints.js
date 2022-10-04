import { getKnex } from '../../knex'
import omit from 'lodash.omit'

export default async function handler (req, res) {
  const { method, body } = req
  if (!(['GET', 'POST', 'PATCH'].includes(method))) {
    return res.status(405).json({
      error: true,
      message: 'Method Not Allowed'
    })
  }

  if (['POST', 'PATCH'].includes(method) && !body) {
    return res.status(400).json({ error: true, reason: 'Bad Request' })
  }

  const knex = getKnex('sd_denuncias')

  try {
    let data = {}
    if (method === 'GET') {
      data = await knex('denuncias').select().orderBy('id')
    }

    if (method === 'POST') {
      await knex.insert([req.body]).into('denuncias')
    }

    if (method === 'PATCH') {
      const { id } = body
      const update = omit(body, 'id')
      await knex('denuncias')
        .where('id', '=', id)
        .update(update)
      data = await knex('denuncias').select()
    }

    await knex.destroy()
    return res.status(200).json(data)
  } catch (error) {
    await knex.destroy()
    return res.status(500).json(error)
  }
}
