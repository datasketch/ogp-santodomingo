import { getKnex } from '../../knex'

export default async function handler (req, res) {
  if (req.method !== 'GET') {
    return res.status(403).json()
  }

  try {
    const knex = getKnex()
    const complaints = await knex('denuncias').select()
    await knex.destroy()
    return res.status(200).json({ data: complaints })
  } catch (error) {
    console.log(error)
    return res.status(500).json(error)
  }
}
