import { ChakraProvider } from '@chakra-ui/react'
import 'leaflet/dist/leaflet.css'

// eslint-disable-next-line react/prop-types
function App ({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default App
