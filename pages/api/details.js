import { getKnex } from '../../knex'
import omit from 'lodash.omit'

export default async function handler (req, res) {
  const { method, body } = req
  if (!(['POST', 'PATCH'].includes(method))) {
    return res.status(405).json({
      error: true,
      message: 'Method Not Allowed'
    })
  }

  if (['POST', 'PATCH'].includes(method) && !body) {
    return res.status(400).json({ error: true, reason: 'Bad Request' })
  }

  const knex = getKnex('sd_plantas')

  try {
    let data = []

    if (method === 'POST') {
      const update = omit(body, 'id')
      await knex.insert([update]).into('detalle_pedidos')
      data = await knex('pedidos').join('detalle_pedidos', { 'detalle_pedidos.Pedido': 'pedidos.id' })
        .join('plantas', { 'plantas.id': 'detalle_pedidos.Planta' })
        .select([
          'pedidos.*',
          knex.raw('json_agg(json_build_object(\'id\', detalle_pedidos.id, \'Planta\', plantas."Planta", \'Cantidad\', detalle_pedidos."Cantidad", \'Contenedor\', plantas."Contenedor", \'Tipo\', plantas."Tipo")) AS "Detalle"')
        ])
        .groupBy('pedidos.id', 'pedidos.Orden')
        .orderBy('pedidos.Orden', 'desc')
    }

    if (method === 'PATCH') {
      const { previousPlants, newPlant } = body
      await knex.transaction((trx) => {
        const queriesPreviousPlants = previousPlants.map(plant => {
          const { id } = plant
          const update = omit(plant, 'id')

          return trx('detalle_pedidos')
            .where('id', '=', id)
            .update(update)
            .transacting(trx)
        })

        const queriesNewPlants = newPlant.map(plant => {
          const update = omit(plant, 'id')

          return trx('detalle_pedidos')
            .insert([update])
            .transacting(trx)
        })
        const queries = [...queriesPreviousPlants, ...queriesNewPlants]

        Promise.all(queries)
          .then(trx.commit)
          .catch(trx.rollback)
      })
    }

    await knex.destroy()
    return res.status(200).json(data)
  } catch (error) {
    console.log(error)
    await knex.destroy()
    return res.status(500).json(error)
  }
}
