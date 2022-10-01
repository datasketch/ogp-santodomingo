import PropTypes from 'prop-types'
import { complaintStatusEnum, dictionary, sourceEnum } from '../utils'
import axios from 'axios'
import toast from 'react-hot-toast'
import { SimpleGrid } from '@chakra-ui/react'
import Column from './Column'
import ColumnCard from './ColumnCard'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { mapComplaint } from '../utils/mapper'
import { useSWRConfig } from 'swr'

function Kanban ({ data }) {
  const { mutate } = useSWRConfig()

  const columns = data.reduce((result, entry) => {
    const key = entry[dictionary.complaintStatus]
    if (!result[key]) {
      return { ...result, [key]: [entry] }
    }
    return { ...result, [key]: [...result[key], entry] }
  }, {})

  const handleDrop = async (id, status, target) => {
    const index = data.findIndex(item => item.id === id)

    data[index][dictionary.complaintStatus] = target

    const op = axios.patch('/api/complaints', {
      id,
      [dictionary.complaintStatus]: target
    }).then(res => res.data)

    mutate('/api/complaints',
      () => toast.promise(op, {
        loading: 'Actualizando base de datos',
        success: () => 'Guardado',
        error: () => 'Se ha presentado un error'
      }),
      {
        optimisticData: data,
        revalidate: true,
        rollbackOnError: true
      })
  }

  const getColor = (data) => {
    return data[dictionary.source] === sourceEnum.CITIZEN ? 'pink' : 'orange'
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 16, md: 4 }}>
        <Column
          category="Recibidas"
          target={complaintStatusEnum.RECEIVED}
          onDrop={handleDrop}
        >
          {(columns[complaintStatusEnum.RECEIVED] || []).map(data => (
            <ColumnCard
              key={data.id}
              data={mapComplaint(data)}
              color={getColor(data)}
            />
          ))}
        </Column>
        <Column
          category="Atendidas"
          target={complaintStatusEnum.ATTENDED}
          onDrop={handleDrop}
        >
          {(columns[complaintStatusEnum.ATTENDED] || []).map(data => (
            <ColumnCard
              key={data.id}
              data={mapComplaint(data)}
              color={getColor(data)}
            />
          ))}
        </Column>
        <Column
          category="Archivadas"
          target={complaintStatusEnum.ARCHIVED}
          onDrop={handleDrop}
        >
          {(columns[complaintStatusEnum.ARCHIVED] || []).map(data => (
            <ColumnCard
              key={data.id}
              data={mapComplaint(data)}
              color={getColor(data)}
            />
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
