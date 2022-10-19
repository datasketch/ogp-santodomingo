import {
  Box, Button, Heading, Stack, Text, useDisclosure
} from '@chakra-ui/react'

import axios from 'axios'
import groupBy from 'lodash.groupby'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import KanbanBoard from '../../components/KanbanBoard'
import KanbanCard from '../../components/KanbanCard'
import KanbanColumn from '../../components/KanbanColumn'
import AddPlant from '../../components/orders/AddPlant'
import UpdatePlant from '../../components/orders/UpdatePlant'
import Layout from '../../components/orders/Layout'
import PlantCardContent from '../../components/orders/PlantCardContent'
import { growingPlantsDictionary as dict } from '../../utils/orders/dictionary'
import { gardenStatusEnum } from '../../utils/orders/enum'
import { mapGrowingPlant } from '../../utils/orders/mapper'

function GrowingPlantsPage () {
  const { data, error, mutate } = useSWR('/api/plants', (url) => axios.get(url).then(res => res.data))
  const { isOpen: isOpenAddPlant, onOpen: onOpenAddPlant, onClose: onCloseAddPlant } = useDisclosure()
  const { isOpen: isOpenUpdatePlant, onOpen: onOpenUpdatePlant, onClose: onCloseUpdatePlant } = useDisclosure()
  const addPlant = useRef()
  const updatePlant = useRef()
  const [selectedData, setSelectedData] = useState()

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
    setSelectedData(data)
    onOpenUpdatePlant()
  }

  return (
    <>
      <Box as="div" mt={4}>
        {data.length
          ? (
            <>
              <Stack
                direction={{ base: 'column', md: 'row' }}
                alignItems="center"
                spacing={3}
                mb={4}
              >
                <Heading color="gray.700">Plantas en desarrollo</Heading>
                <Button
                  size={'sm'}
                  colorScheme='blackAlpha'
                  variant='outline'
                  ref={addPlant}
                  onClick={() => {
                    onOpenAddPlant(true)
                    setSelectedData()
                  }}
                >
                  + Agregar
                </Button>
              </Stack>
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
                        ref={updatePlant}
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
      <AddPlant
        isOpen={isOpenAddPlant}
        onClose={onCloseAddPlant}
        btnRef={addPlant}
      />
      {selectedData && (
        <UpdatePlant
          isOpen={isOpenUpdatePlant}
          onClose={onCloseUpdatePlant}
          btnRef={updatePlant}
          data={selectedData}
          setData={setSelectedData}
        />
      )}
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
