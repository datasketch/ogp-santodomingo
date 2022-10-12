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
import { format } from 'date-fns'

export default function ComplaintsHomePage () {
  const { data, error, mutate } = useSWR('/api/complaints', (url) => axios.get(url).then(res => res.data))
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedData, setSelectedData] = useState()
  const [enteredFromDate, setEnteredFromDate] = useState('')
  const [enteredToDate, setEnteredToDate] = useState('')
  const currentDate = format(new Date(), 'yyyy-MM-dd')

  const filterByRangeDate = (data, fromDate, toDate) => {
    // eslint-disable-next-line array-callback-return
    return data.filter(item => {
      if (fromDate && !toDate) {
        // Si desde tiene y hasta no, entonces se filtra desde la fecha desde hasta la fecha actual

        // console.log('desde - 0')

        // item
        // 01 - 10 - 2022
        // 02 - 10 - 2022
        // 03 - 10 - 2022
        // 04 - 10 - 2022
        // 12 - 10 - 2022

        // ejemplo
        // entered from Date -> 03 - 10 - 2022
        // current date -> 12 - 10 - 2022

        return new Date(fromDate) <= new Date(item['Fecha de denuncia']) && new Date(currentDate) >= new Date(item['Fecha de denuncia'])
      }

      if (!fromDate && toDate) {
        // Si desde no tiene y hasta sí, entonces se filtra desde el inicio de los tiempo hasta la fecha hasta

        // console.log('0 - hasta')

        // item
        // 01 - 10 - 2022
        // 02 - 10 - 2022
        // 03 - 10 - 2022
        // 04 - 10 - 2022
        // 12 - 10 - 2022

        // ejemplo
        // entered to Date -> 04 - 10 - 2022
        return new Date(toDate) >= new Date(item['Fecha de denuncia'])
      }

      if (fromDate && toDate) {
        // console.log('desde - hasta')
        // Si ambas tienen

        // item
        // 01 - 10 - 2022
        // 02 - 10 - 2022
        // 03 - 10 - 2022
        // 04 - 10 - 2022
        // 12 - 10 - 2022

        // ejemplo
        // entered from Date -> 01 - 10 - 2022
        // entered to Date -> 03 - 10 - 2022
        return new Date(fromDate) <= new Date(item['Fecha de denuncia']) && new Date(toDate) >= new Date(item['Fecha de denuncia'])
      }
    })
  }

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando tablero de gestión...</Text>

  // Filtrar las denuncias según los estados a manipular

  // Si los estados DESDE - HASTA de fechas esta vacio, tomo el valor por defecto de data

  const isFilterDates = enteredFromDate || enteredToDate

  const filteredData = !isFilterDates
    ? data
    : filterByRangeDate(data, enteredFromDate, enteredToDate)

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

  const fromDateChangeHandler = (event) => setEnteredFromDate(event.target.value)

  const toDateChangeHandler = (event) => setEnteredToDate(event.target.value)

  const clearInputsClickHandler = () => {
    setEnteredFromDate('')
    setEnteredToDate('')
  }

  // console.log(complaintStatusEnum)

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
                <Box display="flex" alignItems="center" columnGap={10}>
                  <Box display="flex" alignItems="center" columnGap={1}>
                    <Text flexShrink={0}>Desde :</Text>
                    <Input type="date" value={enteredFromDate} max={currentDate} onChange={fromDateChangeHandler} />
                  </Box>
                  <Box display="flex" alignItems="center" columnGap={1}>
                    <Text flexShrink={0}>Hasta :</Text>
                    <Input type="date" value={enteredToDate} max={currentDate} min={enteredFromDate} onChange={toDateChangeHandler} />
                  </Box>
                  <Button colorScheme='blackAlpha' variant='outline' onClick={clearInputsClickHandler}>
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
