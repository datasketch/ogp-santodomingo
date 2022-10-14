import { getKnex } from '../../knex'

export default async function handler (req, res) {
  const { method } = req
  if (!(['GET', 'POST'].includes(method))) {
    return res.status(405).json({
      error: true,
      message: 'Method Not Allowed'
    })
  }

  const knex = getKnex('sd_plantas')

  try {
    let data = []
    if (method === 'GET') {
      data = await knex('plantas')
    }
    if (method === 'POST') {
      await knex.insert([req.body]).into('plantas')
    }
    await knex.destroy()
    return res.status(200).json(data)
  } catch (error) {
    await knex.destroy()
    console.log(error)
    return res.status(500).json(error)
  }
}
