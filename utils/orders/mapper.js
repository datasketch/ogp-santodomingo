import { reverseDictionary } from './dictionary'

function mapOrder (order) {
  return Object.keys(order).reduce((result, key) => {
    return {
      ...result,
      [reverseDictionary[key]]: order[key]
    }
  }, {})
}

export { mapOrder }
