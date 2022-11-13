import { Box, ChakraProvider } from '@chakra-ui/react'
import { Toaster } from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'
import '../styles.css'

// eslint-disable-next-line react/prop-types
function App ({ Component, pageProps }) {
  // eslint-disable-next-line react/prop-types
  const { fullWidth } = pageProps
  const container = {
    as: 'div',
    maxW: fullWidth ? 'full' : 'container.xl',
    mx: 'auto',
    px: fullWidth ? 0 : 4
  }
  // eslint-disable-next-line react/prop-types
  const getLayout = Component.getLayout || ((page) => page)
  return (
    <ChakraProvider>
      <Toaster />
      <Box {...container}>
        {getLayout(<Component {...pageProps} />)}
      </Box>
    </ChakraProvider>
  )
}

export default App
