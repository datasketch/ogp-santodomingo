import { dictionary } from './dictionary'
import { reverseDictionary } from '..'

function mapComplaints (data) {
  const reversed = reverseDictionary(dictionary)
  return data.map(item => {
    return Object.keys(item).reduce((result, key) => {
      return {
        ...result,
        [reversed[key]]: item[key]
      }
    }, {})
  })
}

function mapComplaint (complaint) {
  const reversed = reverseDictionary(dictionary)
  return Object.keys(complaint).reduce((result, key) => {
    return {
      ...result,
      [reversed[key]]: complaint[key]
    }
  }, {})
}

export { mapComplaints, mapComplaint }
