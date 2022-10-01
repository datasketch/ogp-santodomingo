import { getKnex } from '../../knex'

export default async function handler (req, res) {
  if (req.method !== 'POST') {
    return res.status(403).json({ error: true, reason: 'Forbidden' })
  }

  if (!req.body) {
    return res.status(400).json({ error: true, reason: 'Bad Request' })
  }

  try {
    const knex = getKnex()
    const id = await knex.insert([req.body], ['id']).into('denuncias')
    await knex.destroy()
    return res.status(200).json({ data: id })
  } catch (error) {
    console.log(error)
    return res.status(500).json(error)
  }
}
