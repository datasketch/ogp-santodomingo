import { icon } from 'leaflet'
import PropTypes from 'prop-types'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { useMemo, useRef, useState } from 'react'

const markerIcon = icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png'
})

function Map ({ center, onMarkerMove }) {
  const markerRef = useRef(null)
  const [position, setPosition] = useState(center)
  const eventHandlers = useMemo(
    () => ({
      dragend () {
        const marker = markerRef.current
        if (marker != null) {
          const coords = marker.getLatLng()
          setPosition(coords)
          onMarkerMove(coords)
        }
      }
    }),
    [onMarkerMove, position]
  )
  return (
    <MapContainer center={center} zoom={15} scrollWheelZoom={false} style={{ height: '500px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        icon={markerIcon}
        position={position}
        ref={markerRef}
        eventHandlers={eventHandlers}
        draggable
      />
    </MapContainer>
  )
}

Map.propTypes = {
  center: PropTypes.object,
  onMarkerMove: PropTypes.func
}

export default Map
