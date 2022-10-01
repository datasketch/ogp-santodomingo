import PropTypes from 'prop-types'
// import { complaintStatusEnum, dictionary, sourceEnum } from '../utils/complaints'
// import axios from 'axios'
// import toast from 'react-hot-toast'
import { Stack } from '@chakra-ui/react'
// import Column from './Column'
// import ColumnCard from './ColumnCard'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
// import { mapComplaint } from '../utils/complaints/mapper'
// import { useSWRConfig } from 'swr'

function KanbanBoard ({ children }) {
  // const { mutate } = useSWRConfig()

  // const columns = data.reduce((result, entry) => {
  //   const key = entry[dictionary.complaintStatus]
  //   if (!result[key]) {
  //     return { ...result, [key]: [entry] }
  //   }
  //   return { ...result, [key]: [...result[key], entry] }
  // }, {})

  // const handleDrop = async (id, status, target) => {
  //   const index = data.findIndex(item => item.id === id)

  //   data[index][dictionary.complaintStatus] = target

  //   const op = axios.patch('/api/complaints', {
  //     id,
  //     [dictionary.complaintStatus]: target
  //   }).then(res => res.data)

  //   mutate('/api/complaints',
  //     () => toast.promise(op, {
  //       loading: 'Actualizando base de datos',
  //       success: () => 'Guardado',
  //       error: () => 'Se ha presentado un error'
  //     }),
  //     {
  //       optimisticData: data,
  //       revalidate: true,
  //       rollbackOnError: true
  //     })
  // }

  // const getColor = (data) => {
  //   return data[dictionary.source] === sourceEnum.CITIZEN ? 'pink' : 'orange'
  // }

  return (
    <DndProvider backend={HTML5Backend}>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 16, md: 4 }} overflow="auto">
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
