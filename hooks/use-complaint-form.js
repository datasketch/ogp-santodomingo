import { useEffect, useState } from 'react'
import { dictionary } from '../utils/complaints/dictionary'

function useComplaintForm (data = {}) {
  const defaultValues = Object.keys(data).reduce((result, key) => {
    return {
      ...result,
      [dictionary[key]]: data[key]
    }
  }, {})
  // const [coordinates, setCoordinates] = useState(`${center.lat}, ${center.lng}`)
  const [coordinates, setCoordinates] = useState('-0.254167, -79.1719')
  const [lat, lng] = coordinates.split(',')
  const center = {
    lat: Number.parseFloat(lat),
    lng: Number.parseFloat(lng)
  }

  useEffect(() => {
    if (!data.location) return
    setCoordinates(data.location)
  }, [data.location])

  return {
    center,
    defaultValues,
    coordinates,
    setCoordinates
  }
}

export { useComplaintForm }
