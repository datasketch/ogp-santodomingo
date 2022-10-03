export const reverseDictionary = (dictionary) => Object.entries(dictionary).reduce((result, [key, value]) => {
  return { ...result, [value]: key }
}, {})
