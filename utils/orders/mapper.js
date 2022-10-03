import { dictionary as orderDictionary, orderDetailDictionary } from './dictionary'
import { reverseDictionary } from '..'

function mapOrder (order) {
  const reversed = reverseDictionary(orderDictionary)
  return Object.keys(order).reduce((result, key) => {
    if (key === 'Detalle') {
      const details = mapOrderDetail(order.Detalle)
      return {
        ...result,
        details
      }
    }
    return {
      ...result,
      [reversed[key]]: order[key]
    }
  }, {})
}

function mapOrderDetail (details) {
  const reversed = reverseDictionary(orderDetailDictionary)
  return details.map(detail => (
    Object.keys(detail).reduce((result, key) => {
      return {
        ...result,
        [reversed[key]]: detail[key]
      }
    }, {})
  ))
}

export { mapOrder }
