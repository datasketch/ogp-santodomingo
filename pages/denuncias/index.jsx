import { Box, Button, Heading, Input, Text, useDisclosure } from '@chakra-ui/react'
import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import KanbanBoard from '../../components/KanbanBoard'
import KanbanColumn from '../../components/KanbanColumn'
import { complaintStatusEnum } from '../../utils/complaints/enum'
import { dictionary } from '../../utils/complaints/dictionary'
import groupBy from 'lodash.groupby'
import KanbanCard from '../../components/KanbanCard'
import Layout from '../../components/complaints/Layout'
import ComplaintCardContent from '../../components/complaints/ComplaintCardContent'
import { mapComplaint } from '../../utils/complaints/mapper'
import ComplaintDialog from '../../components/complaints/ComplaintDialog'
import useFilterByDate from '../../hooks/use-filtered-data'

export default function ComplaintsHomePage () {
  const { data, error, mutate } = useSWR('/api/complaints', (url) => axios.get(url).then(res => res.data))
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedData, setSelectedData] = useState()
  const {
    startDate,
    endDate,
    currentDate,
    startDateChangeHandler,
    endDateChangeHandler,
    clearInputsClickHandler,
    filteredData
  } = useFilterByDate(data, '', dictionary.complaintDate)

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando tablero de gestión...</Text>

  const columns = groupBy(filteredData, dictionary.complaintStatus)

  const handleDrop = async (id, target) => {
    const index = data.findIndex(item => item.id === id)

    data[index][dictionary.complaintStatus] = target

    const op = axios.patch('/api/complaints', {
      id,
      [dictionary.complaintStatus]: target
    }).then(res => res.data)

    mutate(
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

  const handleClick = (data) => {
    onOpen()
    setSelectedData(data)
  }

  return (
    <>
      <ComplaintDialog
        isOpen={isOpen}
        onClose={onClose}
        data={selectedData}
      />
      <Box as="div" mt={6}>
        {data.length
          ? (
            <>
              <Box display="flex" rowGap={6} flexDirection={{ base: 'column', lg: 'row' }} alignItems="center" justifyContent="space-between" mb={4}>
                <Heading color="gray.700">Tablero de denuncias</Heading>
                <Box display="flex" alignItems="center" flexWrap="wrap" justifyContent="space-between" rowGap={4} columnGap={{ xl: 6 }}>
                  <Box display="flex" width={{ base: '45%', lg: '30%', xl: 'auto' }} alignItems="center" columnGap={1}>
                    <Text flexShrink={0}>Desde :</Text>
                    <Input type="date" value={startDate} max={currentDate} onChange={startDateChangeHandler} />
                  </Box>
                  <Box display="flex" width={{ base: '45%', lg: '30%', xl: 'auto' }} alignItems="center" columnGap={1}>
                    <Text flexShrink={0}>Hasta :</Text>
                    <Input type="date" value={endDate} max={currentDate} min={startDate} onChange={endDateChangeHandler} />
                  </Box>
                  <Button width={{ base: '100%', lg: '30%', xl: 'auto' }} colorScheme='blackAlpha' variant='outline' onClick={clearInputsClickHandler}>
                    Restablecer filtros
                  </Button>
                </Box>
              </Box>
              <KanbanBoard>
                {Object.entries(complaintStatusEnum).map(([key, status]) => (
                  <KanbanColumn
                    key={key}
                    title={status}
                    target={status}
                    cards={columns[status] || []}
                    onDrop={handleDrop}
                  >
                    {(columns[status] || []).map(data => (
                      <KanbanCard
                        key={data.id}
                        item={{ id: data.id, status: data[dictionary.status] }}
                        data={data}
                        mapper={mapComplaint}
                        onClick={() => handleClick(mapComplaint(data))}
                      >
                        {(data) => (
                          <ComplaintCardContent data={data} />
                        )}
                      </KanbanCard>
                    ))}
                  </KanbanColumn>
                ))}
              </KanbanBoard>
            </>
            )
          : <Text align="center">No hay denuncias a gestionar</Text>}
      </Box>
    </>
  )
}

ComplaintsHomePage.getLayout = function getLayout (page) {
  return (
    <Layout>
      {page}
    </Layout>
  )
}
