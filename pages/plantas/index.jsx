import { Box, Heading, Text } from '@chakra-ui/react'
import useSWR from 'swr'
// import Kanban from '../../components/Kanban'
import KanbanBoard from '../../components/KanbanBoard'
import groupBy from 'lodash.groupby'
import { statusEnum } from '../../utils/orders/enum'
import KanbanColumn from '../../components/KanbanColumn'
import KanbanCard from '../../components/KanbanCard'
import { dictionary } from '../../utils/orders/dictionary'
import axios from 'axios'
import toast from 'react-hot-toast'
import { mapOrder } from '../../utils/orders/mapper'
import OrderCardContent from '../../components/orders/OrderCardContent'

export default function Home () {
  const { data, error, mutate } = useSWR('/api/orders', (url) => axios.get(url).then(res => res.data))

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

  return (
    <>
      <Box as="div" mt={4}>
        {data.length
          ? (
            <>
              <Heading color="gray.700" mb={4}>Tablero de órdenes</Heading>
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
                      >
                        {(data) => (
                          <OrderCardContent data={data} />
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
