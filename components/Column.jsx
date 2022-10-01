import { Badge, Box, Heading, Stack } from '@chakra-ui/react'
import PropTypes from 'prop-types'
import { useDrop } from 'react-dnd'

function Column ({ category, target, children, onDrop }) {
  const [{ canDrop }, drop] = useDrop(() => ({
    accept: 'card',
    drop: ({ id, status }) => {
      if (status === target) {
        return
      }
      onDrop(id, status, target)
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop()
    })
  }))
  return (
    <Box bgColor='gray.50'>
      <Heading fontSize="md" letterSpacing="wide" p={4}>
        <Badge px={2} py={1} rounded="lg">
          {category}
        </Badge>
      </Heading>
      <Stack
        direction={{ base: 'row', md: 'column' }}
        h={{ base: 300, md: 600 }}
        p={4}
        pt={0}
        spacing={4}
        opacity={canDrop ? '0.5' : '1'}
        rounded='lg'
        boxShadow="md"
        overflow="auto"
        ref={drop}
      >
        {children}
      </Stack>
    </Box>
  )
}

Column.propTypes = {
  category: PropTypes.string,
  target: PropTypes.string,
  onDrop: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)])
}

export default Column
