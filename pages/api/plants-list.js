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
      data = await knex.select('id', 'Planta', 'Contenedor').from('plantas')
    }

    await knex.destroy()
    return res.status(200).json(data)
  } catch (error) {
    await knex.destroy()
    console.log(error)
    return res.status(500).json(error)
  }
}
