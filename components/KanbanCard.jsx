import { Box } from '@chakra-ui/react'
import PropTypes from 'prop-types'
import { useDrag } from 'react-dnd'

function KanbanCard ({ item, data, onClick, mapper = (_) => _, children }) {
  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: 'card',
      item,
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1
      })
    })
  )

  const cardData = mapper(data)
  return (
    <Box
      as="div"
      role="group"
      rounded="lg"
      px={4}
      py={4}
      boxShadow="lg"
      cursor="grab"
      minW={200}
      bgColor="white"
      ref={dragRef}
      style={{ opacity }}
      border="1px"
      borderColor="transparent"
      position="relative"
      _hover={{
        borderColor: 'blackAlpha.300'
      }}
      onClick={onClick}

    >
      {children(cardData)}
    </Box>
  )
}

KanbanCard.propTypes = {
  item: PropTypes.object,
  data: PropTypes.object,
  mapper: PropTypes.func,
  children: PropTypes.func,
  onClick: PropTypes.func

}

export default KanbanCard
