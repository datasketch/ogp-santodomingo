import { Box, Button, Heading, Input, Stack, Text, useDisclosure } from '@chakra-ui/react'
import axios from 'axios'
import groupBy from 'lodash.groupby'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import KanbanBoard from '../../components/KanbanBoard'
import KanbanCard from '../../components/KanbanCard'
import KanbanColumn from '../../components/KanbanColumn'
import OrderCardContent from '../../components/orders/OrderCardContent'
import { dictionary } from '../../utils/orders/dictionary'
import { mapOrder } from '../../utils/orders/mapper'
import { statusEnum } from '../../utils/orders/enum'
import { useRef, useState } from 'react'
import OrderDialog from '../../components/orders/OrderDialog'
import Layout from '../../components/orders/Layout'
import NewOrder from '../../components/orders/NewOrder'
import useFilterByDate from '../../hooks/use-filtered-data'

export default function PlantsHomePage () {
  const { data, error, mutate } = useSWR('/api/orders', (url) => axios.get(url).then(res => res.data))
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2 } = useDisclosure()
  const btnRef = useRef()
  const [selectedData, setSelectedData] = useState()
  const {
    startDate,
    endDate,
    currentDate,
    startDateChangeHandler,
    endDateChangeHandler,
    clearInputsClickHandler,
    filteredData
  } = useFilterByDate(data, 'plants', dictionary.date, dictionary.deliveryDate)

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando tablero de gestión...</Text>

  const columns = groupBy(filteredData, dictionary.status)

  const handleDrop = async (id, target) => {
    const update = [...data]
    const index = data.findIndex(item => item.id === id)

    update[index][dictionary.status] = target

    const op = axios.patch('/api/orders', {
      id,
      [dictionary.status]: target
    }).then(res => res.data)

    mutate(
      () => toast.promise(op, {
        loading: 'Actualizando base de datos',
        success: () => 'Guardado',
        error: () => 'Se ha presentado un error'
      }),
      {
        optimisticData: update,
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
      {selectedData && <OrderDialog
        isOpen={isOpen}
        onClose={onClose}
        data={selectedData}
        key={selectedData}
        setSelectedData={setSelectedData}
      />}
      <Box as="div" mt={4}>
        {data.length
          ? (
            <>
              <Stack dir="row" flexDir={{ base: 'column', lg: 'row' }} justifyContent={{ lg: 'space-between' }} spacing={{ base: 4, lg: 0 }} mb={8} align={{ lg: 'flex-start' }}>
                <Box display="flex" columnGap={4} alignItems="center" justifyContent={{ base: 'space-between', lg: 'start' }}>
                  <Heading color="gray.700">Tablero de órdenes</Heading>
                  <Button
                    size={'sm'}
                    colorScheme='blackAlpha'
                    variant='outline'
                    alignSelf="self-end"
                    onClick={() => onOpen2(true)}
                  >
                    +Agregar
                  </Button>
                </Box>
                <Box>
                  <Box display="flex" gap={4} flexDirection={{ base: 'column', lg: 'row' }}>
                    <Box>
                      <Text flexShrink={0}>Desde :</Text>
                      <Input type="date" value={startDate} max={currentDate} onChange={startDateChangeHandler} />
                    </Box>
                    <Box>
                      <Text flexShrink={0}>Hasta :</Text>
                      <Input type="date" value={endDate} max={currentDate} min={startDate} onChange={endDateChangeHandler} />
                    </Box>
                    <Button width={{ base: '100%', lg: '30%', xl: 'auto' }} colorScheme='blackAlpha' variant='outline' alignSelf={{ lg: 'self-end' }} onClick={clearInputsClickHandler}>
                      Restablecer filtros
                    </Button>
                  </Box>
                  <Text fontSize={'sm'}>Este filtro combina fecha de orden y fecha de entrega</Text>
                </Box>
              </Stack>
              <KanbanBoard>
                {Object.entries(statusEnum).map(([key, status]) => (
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
                        mapper={mapOrder}
                        onClick={() => handleClick(mapOrder(data))}
                      >
                        {(data) => (
                          <OrderCardContent data={data} />
                        )}
                      </KanbanCard>
                    ))}
                  </KanbanColumn>
                ))}
              </KanbanBoard>
              <NewOrder isOpen={isOpen2} onClose={onClose2} btnRef={btnRef} />
            </>
            )
          : <Text align="center">No hay pedidos a gestionar</Text>}
      </Box>
    </>
  )
}

PlantsHomePage.getLayout = function getLayout (page) {
  return (
    <Layout>
      {page}
    </Layout>
  )
}
