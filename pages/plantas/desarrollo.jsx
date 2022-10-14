import {
  Box, Button, Heading, Text, useDisclosure
} from '@chakra-ui/react'

import axios from 'axios'
import groupBy from 'lodash.groupby'
import { useRef } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import KanbanBoard from '../../components/KanbanBoard'
import KanbanCard from '../../components/KanbanCard'
import KanbanColumn from '../../components/KanbanColumn'
import AddPlant from '../../components/orders/AddPlant'
import Layout from '../../components/orders/Layout'
import PlantCardContent from '../../components/orders/PlantCardContent'
import { growingPlantsDictionary as dict } from '../../utils/orders/dictionary'
import { gardenStatusEnum } from '../../utils/orders/enum'
import { mapGrowingPlant } from '../../utils/orders/mapper'

function GrowingPlantsPage () {
  const { data, error, mutate } = useSWR('/api/plants', (url) => axios.get(url).then(res => res.data))
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef()

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando tablero de gestión...</Text>

  const columns = groupBy(data, dict.gardenStatus)

  const handleDrop = async (id, target) => {
    const update = [...data]
    const index = data.findIndex(item => item.id === id)

    update[index][dict.gardenStatus] = target

    const op = axios.patch('/api/plants', {
      id,
      [dict.gardenStatus]: target
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
    console.log(data)
  }

  return (
    <>
      <Box as="div" mt={4}>
        {data.length
          ? (
            <>
              <Box display="flex" rowGap={6} alignItems="center" columnGap={10} mb={4}>
                <Heading color="gray.700">Plantas en desarrollo</Heading>
                <Button width={{ base: '100%', lg: '30%', xl: 'auto' }} colorScheme='blackAlpha' variant='outline' ref={btnRef} onClick={() => onOpen(true)}>
                  + Agregar
                </Button>
              </Box>
              <KanbanBoard>
                {Object.entries(gardenStatusEnum).map(([key, status]) => (
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
                        item={{ id: data.id, status: data[dict.gardenStatus] }}
                        data={data}
                        mapper={mapGrowingPlant}
                        onClick={() => handleClick(mapGrowingPlant(data))}
                      >
                        {(data) => (
                          <PlantCardContent data={data} />
                        )}
                      </KanbanCard>
                    ))}
                  </KanbanColumn>
                ))}
              </KanbanBoard>
            </>
            )
          : (
            <Text align="center">No hay plantas en desarrollo</Text>
            )}
      </Box>
      <AddPlant isOpen={isOpen} onClose={onClose} btnRef={btnRef} />
    </>
  )
}

GrowingPlantsPage.getLayout = function getLayout (page) {
  return (
    <Layout>
      {page}
    </Layout>
  )
}

export default GrowingPlantsPage
