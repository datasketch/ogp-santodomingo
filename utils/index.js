import { difference } from 'd3-array'

export const reverseDictionary = (dictionary) => Object.entries(dictionary).reduce((result, [key, value]) => {
  return { ...result, [value]: key }
}, {})

export const parseData = (input, config = { omit: [] }) => {
  const columns = input.length > 0 ? Array.from(difference(Object.keys(input.at(0)), config.omit)) : []
  const data = input.length > 0
    ? input.map(item => (
      Array.from(difference(Object.keys(item), config.omit)).map(key => item[key])
    ))
    : []
  return {
    data,
    columns
  }
}
