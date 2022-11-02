/* eslint-disable no-unused-vars */
import { Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, FormControl, FormHelperText, Input, Select, Stack, Tab, Table, TableContainer, TabList, TabPanel, TabPanels, Tabs, Tbody, Td, Text, Textarea, Th, Thead, Tr } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import isEmpty from 'lodash.isempty'
import PropTypes from 'prop-types'
import { orderDetailDictionary, dictionary, inventoryDictionary } from '../../utils/orders/dictionary'
import { useForm } from 'react-hook-form'
import { parishesPlants } from '../../utils/complaints'
import useSWR, { mutate } from 'swr'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { statusEnum } from '../../utils/orders/enum'
import { parseData } from '../../utils'
import { format } from 'date-fns'
import dynamic from 'next/dist/shared/lib/dynamic'

const Map = dynamic(() => import('../../components/Map'), {
  ssr: false
})

function OrderDialog ({ isOpen, onClose, data = {} }) {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [addedPlant, setAddedPlant] = useState({})
  const [addPlantRow, setAddPlantRow] = useState(false)
  const [enableSave, setEnableSave] = useState(false)
  const [coordinates, setCoordinates] = useState('-0.254167, -79.1719')
  const [position, setPosition] = useState({ lat: -0.254167, lng: -79.1719 })
  const [canton, setCanton] = useState('')

  const [selectedPlant, setSelectedPlant] = useState({})
  const [plants, setPlants] = useState([])
  const [newPlant, setNewPlant] = useState([])
  const [previousPlants, setPreviousPlants] = useState([])

  const { data: inventory, error } = useSWR('/api/inventory', (url) => axios.get(url).then(res => res.data))
  const { data: allPlants, error: plantsError } = useSWR('/api/plants-list')

  const { register, handleSubmit } = useForm({
    mode: 'onBlur',
    defaultValues: {
      [dictionary.name]: data.name,
      [dictionary.identifier]: data.identifier,
      [dictionary.address]: data.address,
      [dictionary.phoneNumber]: data.phoneNumber,
      [dictionary.canton]: data.canton,
      [dictionary.subsidy]: data.subsidy,
      [dictionary.collaborators]: data.collaborators,
      [dictionary.survival]: data.survival,
      [dictionary.measurementDate]: data.measurementDate,
      [dictionary.location]: data.location,
      [dictionary.actor]: data.actor,
      [dictionary.parish]: data.parish,
      [dictionary.status]: data.status
    }
  })
  const parsedData = parseData((inventory || []), {
    omit: [
      inventoryDictionary.unitsReadyForDelivery,
      inventoryDictionary.unitsDelivered,
      inventoryDictionary.type
    ]
  })

  useEffect(() => {
    if (!data || isEmpty(data) || !data.details?.length) return
    const headers = Object.keys(data.details.at(0)).map(key => orderDetailDictionary[key])
    const rows = data.details.reduce((result, detail) => {
      return [...result, Object.values(detail)]
    }, [])
    setHeaders(headers)
    setRows(rows)
    setPlants(data.details)
    setPreviousPlants(data.details.map(plant => {
      const match = allPlants.find(pl => plant.plant === pl.Planta && plant.container === pl.Contenedor)
      return {
        id: plant.id,
        Planta: match.id,
        Cantidad: plant.qty
      }
    }))
    if (data.location) {
      setCoordinates(prev => data.location || prev)
      setPosition({ lat: data.location?.split(',')[0], lng: data.location?.split(',')[1] })
    }
    setCanton(data.canton || '')
  }, [data])

  if (error || plantsError) return <p>Se ha presentado un error</p>
  if (!inventory) return null

  // const groupedByName = Array.from(group(inventory, d => d.Planta))
  // const names = groupedByName.map(([name]) => name)

  const onSubmit = (formData, coordinates) => {
    const input = {
      ...formData,
      [dictionary.location]: coordinates,
      id: data.id
    }
    const op = axios.patch('/api/orders', input)
    mutate(
      '/api/orders',
      () => toast.promise(op, {
        loading: 'Actualizando base de datos',
        success: () => 'Guardado',
        error: () => 'Se ha presentado un error'
      }),
      {
        revalidate: true
      }).then(() => {
      onClose()
    })
    const plants = { previousPlants, newPlant }
    updateDetails(plants)
  }

  const calculateDefaultValue = (plant, container, array) => {
    const defaultValue = array.filter(pl => pl.plant === plant && pl.container === container)[0]
    return defaultValue?.qty || null
  }

  const handlePlantsSelect = (event, index, plant, container) => {
    const { value } = event.target
    const previous = plants.find(pl => plant === pl.plant && container === pl.container)
    const match = allPlants.find(pl => plant === pl.Planta && container === pl.Contenedor)
    if (!previous) {
      const input = {
        Planta: match.id,
        Cantidad: +value,
        Pedido: data.id
      }
      updateState(newPlant, input, setNewPlant)
      return
    }

    const input = {
      id: previous.id,
      Planta: match.id,
      Cantidad: +value
    }

    updateState(previousPlants, input, setPreviousPlants)
  }

  const updateDetails = (input) => {
    const op = axios.patch('/api/details', input)
    mutate(
      '/api/orders',
      () => (
        toast.promise(op, {
          loading: 'Enviando...',
          success: 'Guardado',
          error: error => {
            console.log(error)
            return 'Se ha presentado un error'
          }
        })
      ),
      {
        revalidate: true,
        rollbackOnError: true
      }
    ).then(() => {
      setRows(prevState => ([
        ...prevState,
        ['', selectedPlant.Planta, addedPlant.Cantidad, selectedPlant.Contenedor, selectedPlant.Tipo]
      ]))
      handleClose()
    })
  }

  const updateState = (previousData = [], input = {}, setData) => {
    const matchIndex = previousData.findIndex(plant => plant.Planta === input.Planta)
    if (matchIndex === -1) {
      setData(prevState => (
        [...prevState, input]
      ))
      return
    }
    const state = [
      ...previousPlants.slice(0, matchIndex),
      input,
      ...previousPlants.slice(matchIndex + 1)
    ]
    setData(state)
  }
  const handleCancel = () => {
    setAddPlantRow(false)
    setAddedPlant({})
    setSelectedPlant({})
    setEnableSave(false)
  }

  const handleClose = () => {
    setAddPlantRow(false)
    setAddedPlant({})
    setSelectedPlant({})
    setEnableSave(false)
    setNewPlant([])
    setPreviousPlants([])
    onClose()
  }

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={handleClose}
      size="xl"
    >
      <DrawerOverlay />
      <DrawerContent overflowY='scroll'>
        <DrawerCloseButton />
        <DrawerHeader>
          <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} columnGap={10} alignItems="center">
            <Box fontSize="md">
              <Text letterSpacing="wide">Detalle orden #{data.order}</Text>
            </Box>
            {data.year && <Box fontSize="md">
              <Text letterSpacing="wide">Año - {data.year}</Text>
            </Box>}
            {data.status && <Box fontSize="md">
              <Text letterSpacing="wide">Estado - {data.status}</Text>
            </Box>}
          </Box>
        </DrawerHeader>
        <DrawerBody>
          <Tabs>
            <TabList>
              <Tab><Text as='b'>Información General</Text></Tab>
              <Tab><Text as='b'>Informes</Text></Tab>
              <Tab><Text as='b'>Actualizar Pedido</Text></Tab>
            </TabList>
            <form id="edit-order" onSubmit={handleSubmit((data) => onSubmit(data, coordinates))}>
              <TabPanels>
                <TabPanel>
                  <Stack spacing={4}>
                    <Box fontSize="md">
                      <Text letterSpacing="wide">Estado</Text>
                      <Select
                        {...register(dictionary.status)}
                      >
                        {Object.values(statusEnum).map(value => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </Select>
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Nombre beneficiario</Text>
                      <Input type='text' {...register(dictionary.name)} />
                    </Box>
                    <Box fontSize="md">
                      <Text letterSpacing="wide">Nombre beneficiario</Text>
                      <Input type='date' {...register(dictionary.date)} value={format(new Date(data.date).getTime(), 'yyyy-MM-dd')} />
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Identificación</Text>
                      <Input type='text' {...register(dictionary.identifier)} />
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Contacto</Text>
                      <Input {...register(dictionary.phoneNumber)} />
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Dirección</Text>
                      <Input type='text' {...register(dictionary.address)} />
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Cantón</Text>
                      <Select
                        placeholder='Seleccione una opción'
                        {...register(dictionary.canton)}
                        onChange={(e) => setCanton(e.target.value)}
                        defaultChecked={data.canton}
                        >
                        {['Santo Domingo', 'La Concordia'].map(el =>
                          <option key={el} value={el}>{el}</option>
                        )}
                      </Select>
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Parroquia</Text>
                      <Select
                        placeholder='Seleccione una opción'
                        {...register(dictionary.parish)}>
                        {parishesPlants[canton]?.map(el =>
                          <option key={el} value={el}>{el}</option>
                        )}
                      </Select>
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Ubicación</Text>
                      <Map
                        center={position}
                        onMarkerMove={(coords) => {
                          const { lat, lng } = coords
                          setCoordinates(`${lat}, ${lng}`)
                        }}
                      />
                    </Box>

                  </Stack>
                  <Text fontSize="md" mt={6} fontWeight='bold'>Resumen de pedido</Text>
                  <TableContainer mt={4}>
                    <Table>
                      <Thead>
                        <Tr>
                          {headers.map(header => <Th key={header}>{header}</Th>)}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {rows.map((row, trIndex) => (
                          <Tr key={`row-${trIndex}`}>
                            {row.map((value, tdIndex) => (
                              <Td key={`row-${trIndex}-${tdIndex}`}>{value}</Td>
                            ))}
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  <DrawerFooter>
                    <Button variant='outline' mr={3} onClick={handleClose}>
                      Cancelar
                    </Button>
                    <Button form="edit-order" colorScheme='blue' type="submit">Guardar</Button>
                  </DrawerFooter>
                </TabPanel>
                <TabPanel>
                  <Stack spacing={4}>
                    <Box fontSize="md">
                      <Text letterSpacing="wide">Subsidio o venta</Text>
                      <Input type='text' {...register(dictionary.subsidy)} />
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Informe</Text>
                      <Textarea {...register(dictionary.report)} resize='none' />
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Colaboradores</Text>
                      <Input type='text' {...register(dictionary.collaborators)} />
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Arboles sembrados</Text>
                      <Input type='text' {...register(dictionary.plantedTrees)} />
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Supervivencia individuos</Text>
                      <Input type='number' {...register(dictionary.survival, {
                        valueAsNumber: true
                      })} />
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Fecha de medición</Text>
                      <Input type='date' {...register(dictionary.measurementDate, { value: data.measurementDate, valueAsDate: true })} value={format(new Date(data.measurementDate).getTime(), 'yyyy-MM-dd')} />
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Actor</Text>
                      <Input type='text' {...register(dictionary.actor)} />
                    </Box>
                  </Stack>
                  {/* <Text fontSize="md" mt={6} fontWeight='bold'>Resumen de pedido</Text>
                  <TableContainer mt={4}>
                    <Table>
                      <Thead>
                        <Tr>
                          {headers.map(header => <Th key={header}>{header}</Th>)}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {rows.map((row, trIndex) => (
                          <Tr key={`row-${trIndex}`}>
                            {row.map((value, tdIndex) => (
                              <Td key={`row-${trIndex}-${tdIndex}`}>{value}</Td>
                            ))}
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer> */}
                  <DrawerFooter>
                    <Button variant='outline' mr={3} onClick={handleClose}>
                      Cancelar
                    </Button>
                    <Button form="edit-order" colorScheme='blue' type="submit">Guardar</Button>
                  </DrawerFooter>
                </TabPanel>
                <TabPanel>
                  <TableContainer>
                    <Table>
                      <Thead>
                        <Tr>
                          {parsedData.columns.map(column => (
                            <th key={column}>
                              {column === 'Inventario' ? 'Cantidad' : column}
                            </th>
                          ))}
                        </Tr>
                      </Thead>
                      <Tbody style={{ overflowY: 'scroll' }}>
                        {parsedData.data.map(([plant, container, inventory], index) => (
                          <Tr key={index}>
                            <Td>
                              {plant}
                            </Td>
                            <Td>
                              {container}
                            </Td>
                            <Td>
                              <FormControl>
                                <Input
                                  type="number"
                                  defaultValue={calculateDefaultValue(plant, container, data?.details) || 0}
                                  max={inventory}
                                  min={0}
                                  onChange={event => handlePlantsSelect(event, index, plant, container)}
                                />
                                <FormHelperText>
                                  Hay {inventory} unidades disponibles
                                </FormHelperText>
                              </FormControl>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  <DrawerFooter>
                    <Button variant='outline' mr={3} onClick={handleClose}>
                      Cancelar
                    </Button>
                    <Button form="edit-order" colorScheme='blue' type="submit">Guardar</Button>
                  </DrawerFooter>
                </TabPanel>
              </TabPanels>
            </form>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

OrderDialog.propTypes = {
  data: PropTypes.object,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func
}

export default OrderDialog
