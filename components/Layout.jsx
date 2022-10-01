import { Box } from '@chakra-ui/react'
import { Toaster } from 'react-hot-toast'
import PropTypes from 'prop-types'
import Navbar from './Navbar'

function Layout ({ children }) {
  return (
    <>
      <Toaster />
      <Box as="div" maxW="container.xl" mx="auto" px={4}>
        <Navbar />
        <main>
          { children }
        </main>
      </Box>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)])
}

export default Layout
