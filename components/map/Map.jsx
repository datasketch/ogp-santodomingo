import * as ReactLeaflet from 'react-leaflet'

const { MapContainer } = ReactLeaflet

// eslint-disable-next-line react/prop-types
export default function Map ({ children, ...rest }) {
  return (
    <MapContainer {...rest}>
      {children(ReactLeaflet)}
    </MapContainer>
  )
}
