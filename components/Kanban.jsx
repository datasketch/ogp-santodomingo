import PropTypes from 'prop-types'
import { complaintStatusEnum, dictionary } from '../utils'
import axios from 'axios'
import toast from 'react-hot-toast'
// import { useState } from 'react'
import { SimpleGrid } from '@chakra-ui/react'
import Column from './Column'
import ColumnCard from './ColumnCard'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { mapComplaints } from '../utils/mapper'

function Kanban ({ data }) {
  // const [isUpdating, setIsUpdating] = useState(false)

  const complaints = mapComplaints(data)

  const handleDrop = async (id, target) => {
    // setIsUpdating(true)

    const op = axios.post('/api/update', {
      id,
      [dictionary.complaintStatus]: target
    })

    toast.promise(op, {
      loading: 'Actualizando base de datos',
      success: () => {
        // setIsUpdating(false)
        return 'Éxito'
      },
      error: 'Se ha presentado un error'
    })
  }

  const cards = complaints.reduce((result, entry) => {
    const key = entry.complaintStatus
    if (!result[key]) {
      return { ...result, [key]: [entry] }
    }
    return { ...result, [key]: [...result[key], entry] }
  }, {})

  return (
    <DndProvider backend={HTML5Backend}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 16, md: 4 }}>
        <Column category="Recibidas" target={complaintStatusEnum.RECEIVED} onDrop={handleDrop}>
          {(cards[complaintStatusEnum.RECEIVED] || []).map(data => (
            <ColumnCard key={data.id} data={data} />
          ))}
        </Column>
        <Column category="Atendidas" target={complaintStatusEnum.ATTENDED} onDrop={handleDrop}>
          {(cards[complaintStatusEnum.ATTENDED] || []).map(data => (
            <ColumnCard key={data.id} data={data} />
          ))}
        </Column>
        <Column category="Archivadas" target={complaintStatusEnum.ARCHIVED} onDrop={handleDrop}>
          {(cards[complaintStatusEnum.ARCHIVED] || []).map(data => (
            <ColumnCard key={data.id} data={data} />
          ))}
        </Column>
      </SimpleGrid>
    </DndProvider>
  )
}

Kanban.propTypes = {
  data: PropTypes.array
}

export default Kanban
