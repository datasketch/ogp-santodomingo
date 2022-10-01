import { getKnex } from '../../knex'
import omit from 'lodash.omit'

export default async function handler (req, res) {
  if (req.method !== 'POST') {
    return res.status(403).json({
      error: true,
      message: 'Forbidden'
    })
  }

  if (!req.body) {
    return res.status(400).json({ error: true, reason: 'Bad Request' })
  }

  try {
    const { id } = req.body
    const knex = getKnex()
    const update = omit(req.body, 'id')
    await knex('denuncias')
      .where('id', '=', id)
      .update(update)
    await knex.destroy()
    return res.status(200).json()
  } catch (error) {
    console.log(error)
    return res.status(500).json(error)
  }
}
