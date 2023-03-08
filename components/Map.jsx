import { icon } from 'leaflet'
import PropTypes from 'prop-types'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import { useMemo, useRef, useState } from 'react'
import { Box, FormControl, FormHelperText, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper } from '@chakra-ui/react'
import isFloat from 'validator/lib/isFloat'
import { MapUpdatePos } from './MapUpdatePos'

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

  const updatePosition = (value, key) => {
    if (key !== '') {
      if (!isFloat(value)) return
      setPosition(prev => ({ ...prev, [key]: +value }))
      return onMarkerMove(position)
    }
    setPosition(value)
    onMarkerMove(position)
  }

  // eslint-disable-next-line react/prop-types
  const CheckPosition = useMemo(() => ({ globalMap }) => {
    // eslint-disable-next-line no-unused-vars
    const map = useMapEvents({
      dblclick: ({ latlng }) => {
        const { lat, lng } = latlng
        setPosition({ lat: lat.toFixed(6), lng: lng.toFixed(6) })
      }
    })
    return null
  }, [position])

  return (
    <>
      <MapContainer center={center} zoom={15} doubleClickZoom={false} scrollWheelZoom={true} style={{ height: '500px' }} >
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

        <MapUpdatePos center={position} >
          {(map) => <CheckPosition globalMap={map} />}
        </MapUpdatePos>

      </MapContainer>
      <Box display='flex' gap={10} alignItems="center" >
        <FormControl>
          <FormHelperText>Latitud</FormHelperText>
          <NumberInput pattern='^(-?\d{1,2}(?:\.\d+)?)$' step={0.0005} precision={6} ref={latRef} value={position?.lat} onChange={(e) => updatePosition(e, 'lat')} data-key='lat'>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormHelperText>Longitud</FormHelperText>
          <NumberInput pattern='^(-?\d{1,3}(?:\.\d+)?)$' step={0.0005} precision={6} ref={lngRef} value={position?.lng} onChange={(e) => updatePosition(e, 'lng')} data-key='lng'>
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
  onMarkerMove: PropTypes.func
}

export default Map
