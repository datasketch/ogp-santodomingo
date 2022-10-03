import { Box, ChakraProvider } from '@chakra-ui/react'
import { Toaster } from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'

// eslint-disable-next-line react/prop-types
function App ({ Component, pageProps }) {
  // eslint-disable-next-line react/prop-types
  const getLayout = Component.getLayout || ((page) => page)
  return (
    <ChakraProvider>
      <Toaster />
      <Box as="div" maxW="container.xl" mx="auto" px={4}>
        {getLayout(<Component {...pageProps} />)}
      </Box>
    </ChakraProvider>
  )
}

export default App
