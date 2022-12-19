import {
  Box, Button, Heading, Input, Stack, Text, useDisclosure
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
import useFilterByDate from '../../hooks/use-filtered-data'
import { removeAccents } from '../../utils/orders'

function GrowingPlantsPage () {
  const { data = [], error, mutate } = useSWR('/api/plants', (url) => axios.get(url).then(res => res.data))
  const { isOpen: isOpenAddPlant, onOpen: onOpenAddPlant, onClose: onCloseAddPlant } = useDisclosure()
  const { isOpen: isOpenUpdatePlant, onOpen: onOpenUpdatePlant, onClose: onCloseUpdatePlant } = useDisclosure()
  const addPlant = useRef()
  const updatePlant = useRef()
  const [selectedData, setSelectedData] = useState()
  const [search, setSearch] = useState('')

  const sortedData = data.sort((a, b) => {
    return new Date(b[dict.transplantDate]) - new Date(a[dict.transplantDate])
  })
  const {
    startDate,
    endDate,
    currentDate,
    startDateChangeHandler,
    endDateChangeHandler,
    clearInputsClickHandler,
    filteredData
  } = useFilterByDate(sortedData, dict.transplantDate)
  const filteredPlants = filteredData?.filter(({ Planta }) => {
    const normalized = removeAccents(Planta).toLowerCase()
    return normalized.includes(removeAccents(search).toLowerCase())
  })

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando tablero de gestión...</Text>

  const columns = groupBy(filteredPlants, dict.gardenStatus)

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

  const handleSearch = ({ target }) => {
    const { value } = target
    setSearch(value)
  }

  return (
    <>
      <Box as="div" mt={4}>
        {data.length
          ? (
            <>
              <Stack display="flex" flexDir={{ base: 'column', lg: 'row' }} justifyContent={{ lg: 'space-between' }} spacing={{ base: 4, lg: 0 }} mb={8}>
                <Box display="flex" columnGap={4} alignItems="center" justifyContent={{ base: 'space-between', lg: 'start' }} alignSelf={{ lg: 'self-end' }}>
                  <Heading color="gray.700">Plantas en desarrollo</Heading>
                  <Button
                    size={'sm'}
                    colorScheme='blackAlpha'
                    variant='outline'
                    alignSelf="self-end"
                    onClick={() => onOpenAddPlant(true)}
                  >
                    +Agregar
                  </Button>
                </Box>
                <Box display="flex" alignContent={'center'} gap={4} flexDirection={{ base: 'column', lg: 'row' }}>
                  <Box>
                    <div style={{ height: '24px' }}></div>
                    <Input type="text" placeholder='Buscar planta...' onChange={handleSearch} />
                  </Box>
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
