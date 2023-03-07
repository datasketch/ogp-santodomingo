import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export const MapUpdatePos = ({ center, children }) => {
  const map = useMap()

  useEffect(() => {
    map.setView(center, 15)
  }, [center])
  return children(map)
}

MapUpdatePos.propTypes = {
  center: PropTypes.object
}
