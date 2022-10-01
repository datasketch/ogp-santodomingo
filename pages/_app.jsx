import { ChakraProvider } from '@chakra-ui/react'
import 'leaflet/dist/leaflet.css'
import Layout from '../components/Layout'

// eslint-disable-next-line react/prop-types
function App ({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  )
}

export default App
