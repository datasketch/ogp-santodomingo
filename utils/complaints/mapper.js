import { reverseDictionary } from '.'

function mapComplaints (data) {
  return data.map(item => {
    return Object.keys(item).reduce((result, key) => {
      return {
        ...result,
        [reverseDictionary[key]]: item[key]
      }
    }, {})
  })
}

function mapComplaint (complaint) {
  return Object.keys(complaint).reduce((result, key) => {
    return {
      ...result,
      [reverseDictionary[key]]: complaint[key]
    }
  }, {})
}

export { mapComplaints, mapComplaint }
