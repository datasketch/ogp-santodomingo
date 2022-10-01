import knex from 'knex'
import config from '../knexfile'

export function getKnex (dbName) {
  config.connection.database = dbName
  return knex(config)
}
