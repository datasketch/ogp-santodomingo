import { icon } from 'leaflet'
import PropTypes from 'prop-types'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { useMemo, useRef, useState } from 'react'
import { Box, FormControl, FormHelperText, Input } from '@chakra-ui/react'
import { MapUpdatePos } from './MapUpdatePos'

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

  const handlePosition = (pos) => {
    setPosition(prev => { return { ...prev, ...pos } })
    onMarkerMove(position)
  }

  return (
    <>
      <MapContainer center={center} zoom={15} scrollWheelZoom={false} style={{ height: '500px' }} >
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

        <MapUpdatePos center={position} />
      </MapContainer>
      <Box display='flex' gap={10} alignItems="center" >
        <FormControl>
          <FormHelperText>Latitud</FormHelperText>
          <Input type='number' value={position?.lat} defaultValue={position?.lat} onChange={(e) => handlePosition({ lat: +e.target.value })} autoComplete='off' />
        </FormControl>
        <FormControl>
          <FormHelperText>Longitud</FormHelperText>
          <Input type='number' value={position?.lng} defaultValue={position?.lng} onInput={(e) => handlePosition({ lng: +e.target.value })} autoComplete='off' />
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
