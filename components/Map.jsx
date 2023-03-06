import { icon } from 'leaflet'
import PropTypes from 'prop-types'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useMemo, useRef, useState } from 'react'
import { Box, FormControl, FormHelperText, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper } from '@chakra-ui/react'
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
      dragend (e) {
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

  const updatePosition = (value, key) => {
    if (!isFloat(value)) return
    setPosition(prev => ({ ...prev, [key]: +value }))
    onMarkerMove(position)
  }

  function CheckPosition () {
    const globalMap = useMap()
    // eslint-disable-next-line no-unused-vars
    const map = useMapEvents({
      dblclick: ({ latlng }) => {
        setPosition(latlng)
      },
      moveend: (e) => {
        setPosition(globalMap.getCenter())
      }
    })
    return null
  }

  return (
    <>
      <MapContainer center={center} zoom={15} doubleClickZoom={false} scrollWheelZoom={true} style={{ height: '500px' }}>
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
        <CheckPosition />

      </MapContainer>
      <Box display='flex' gap={10} alignItems="center" >
        <FormControl>
          <FormHelperText>Latitud</FormHelperText>
          <NumberInput step={0.0005} ref={latRef} defaultValue={position?.lat?.toFixed(8)} onChange={(e) => updatePosition(e, 'lat')} data-key='lat'>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormHelperText>Longitud</FormHelperText>
          <NumberInput step={0.0005} ref={lngRef} defaultValue={position?.lng?.toFixed(8)} onChange={(e) => updatePosition(e, 'lng')} data-key='lng'>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
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
