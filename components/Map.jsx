import { icon } from 'leaflet'
import PropTypes from 'prop-types'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { useMemo, useRef, useState } from 'react'
import { Box, FormControl, FormHelperText, Input } from '@chakra-ui/react'
import isFloat from 'validator/lib/isFloat'

const markerIcon = icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png'
})

function Map ({ center, onMarkerMove }) {
  const markerRef = useRef(null)
  const latRef = useRef(null)
  const lngRef = useRef(null)
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

  const updatePosition = (e) => {
    const value = e.target.value
    const { key } = e.target.dataset
    if (!isFloat(value)) return
    setPosition(prev => ({ ...prev, [key]: +value }))
    onMarkerMove(position)
  }

  return (
    <>
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
      <Box display='flex' gap={10} alignItems="center" >
        <FormControl>
          <FormHelperText>Latitud</FormHelperText>
          <Input
            type='number'
            ref={latRef}
            value={position?.lat}
            onChange={updatePosition}
            autoComplete='off'
            data-key='lat'
          />
        </FormControl>
        <FormControl>
          <FormHelperText>Longitud</FormHelperText>
          <Input
            type='number'
            ref={lngRef}
            value={position?.lng}
            onChange={updatePosition}
            autoComplete='off'
            data-key='lng'
          />
        </FormControl>
      </Box>
    </>
  )
}

Map.propTypes = {
  center: PropTypes.object,
  onMarkerMove: PropTypes.func,
  positionChange: PropTypes.func

}

export default Map
