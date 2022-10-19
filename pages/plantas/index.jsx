import { Box, Button, Heading, Text, useDisclosure } from '@chakra-ui/react'
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

export default function PlantsHomePage () {
  const { data, error, mutate } = useSWR('/api/orders', (url) => axios.get(url).then(res => res.data))
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2 } = useDisclosure()
  const btnRef = useRef()
  const [selectedData, setSelectedData] = useState()

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando tablero de gestión...</Text>

  const columns = groupBy(data, dictionary.status)

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
      />}
      <Box as="div" mt={4}>
        {data.length
          ? (
            <>
              <Box display="flex" rowGap={6} alignItems="center" columnGap={10} mb={4}>
                <Heading color="gray.700" mb={4}>Tablero de órdenes</Heading>
                <Button onClick={() => onOpen2(true)}>+Agregar</Button>
              </Box>
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
              <NewOrder isOpen={isOpen2} onClose={onClose2} btnRef={btnRef}/>
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
