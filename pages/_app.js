import { ChakraProvider } from "@chakra-ui/react"
import 'leaflet/dist/leaflet.css'

function App({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default App
