import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export const MapUpdatePos = ({ center }) => {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 15)
  }, [center])
  return null
}

MapUpdatePos.propTypes = {
  center: PropTypes.object
}
