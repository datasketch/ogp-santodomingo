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

export { mapComplaints }
