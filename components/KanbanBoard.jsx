import PropTypes from 'prop-types'
import { Stack } from '@chakra-ui/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

function KanbanBoard ({ children }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 8, md: 4 }} overflow="auto">
        {children}
      </Stack>
    </DndProvider>
  )
}

KanbanBoard.propTypes = {
  data: PropTypes.array,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node)
  ])
}

export default KanbanBoard
