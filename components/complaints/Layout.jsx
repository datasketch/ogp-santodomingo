import PropTypes from 'prop-types'
import Navbar from './Navbar'

function Layout ({ children }) {
  return (
    <>
      <Navbar />
      <main>
        {children}
      </main>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)])
}

export default Layout
