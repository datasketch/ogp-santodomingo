import { Box } from '@chakra-ui/react'
import PropTypes from 'prop-types'
import { useDrag } from 'react-dnd'

function ColumnCard ({ color = 'white', data }) {
  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: 'card',
      item: {
        id: data.id,
        status: data.complaintStatus
      },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1
      })
    })
  )
  return (
    <Box
      as="div"
      role="group"
      rounded="lg"
      p={4}
      boxShadow="lg"
      cursor="grab"
      minW={200}
      bgColor={color}
      ref={dragRef}
      style={{ opacity }}
    >
      <p>{data.companyName || data.fullName}</p>
    </Box>
  )
}

ColumnCard.propTypes = {
  data: PropTypes.object,
  color: PropTypes.string
}

export default ColumnCard
