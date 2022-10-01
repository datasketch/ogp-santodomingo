import knex from 'knex'
import config from '../knexfile'
// import isEmpty from 'lodash.isempty'

// let cached = global.pg
// if (isEmpty(cached)) cached = global.pg = {}

export function getKnex () {
  // if (isEmpty(cached)) cached.instance = knex(config)
  // return cached.instance
  return knex(config)
}
