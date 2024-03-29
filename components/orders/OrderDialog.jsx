/* eslint-disable no-unused-vars */
import { Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, FormControl, FormHelperText, Input, Select, Stack, Tab, Table, TableContainer, TabList, TabPanel, TabPanels, Tabs, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import isEmpty from 'lodash.isempty'
import PropTypes from 'prop-types'
import { orderDetailDictionary, dictionary, inventoryDictionary, typeBeneficiary } from '../../utils/orders/dictionary'
import { useForm } from 'react-hook-form'

import useSWR, { mutate } from 'swr'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { statusEnum } from '../../utils/orders/enum'
import { parseData } from '../../utils'
import { format } from 'date-fns'
import dynamic from 'next/dist/shared/lib/dynamic'
import { parishesPlants, removeAccents } from '../../utils/orders'

const Map = dynamic(() => import('../../components/Map'), {
  ssr: false
})

function OrderDialog ({ isOpen, onClose, setSelectedData, data = {} }) {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [coordinates, setCoordinates] = useState('-0.254167, -79.1719')
  const [position, setPosition] = useState({ lat: -0.254167, lng: -79.1719 })
  const [canton, setCanton] = useState('')

  const [plants, setPlants] = useState([])
  const [newPlant, setNewPlant] = useState([])
  const [previousPlants, setPreviousPlants] = useState([])
  const [query, setQuery] = useState('')

  const { register, handleSubmit, reset, formState: { isSubmitted } } = useForm({
    mode: 'onBlur',
    defaultValues: {
      [dictionary.name]: data.name,
      [dictionary.identifier]: data.identifier,
      [dictionary.address]: data.address,
      [dictionary.phoneNumber]: data.phoneNumber,
      [dictionary.canton]: data.canton,
      [dictionary.subsidy]: data.subsidy,
      [dictionary.typeBeneficiary]: data.typeBeneficiary,
      [dictionary.collaborators]: data.collaborators,
      [dictionary.survival]: data.survival,
      [dictionary.measurementDate]: data.measurementDate ? format(new Date(data.measurementDate), 'yyyy-MM-dd') : '',
      [dictionary.location]: data.location,
      [dictionary.actor]: data.actor,
      [dictionary.parish]: data.parish,
      [dictionary.status]: data.status,
      [dictionary.deliveryDate]: data.deliveryDate ? format(new Date(data.deliveryDate), 'yyyy-MM-dd') : ''
    }
  })

  const { data: inventory, error } = useSWR('/api/inventory', (url) => axios.get(url).then(res => res.data))
  const { data: allPlants, error: plantsError } = useSWR('/api/plants-list')

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
      setPosition({ lat: +data.location?.split(',')[0], lng: +data.location?.split(',')[1] })
    }
    setCanton(data.canton || '')
  }, [data])

  if (error || plantsError) return <p>Se ha presentado un error</p>
  if (!inventory) return null

  const onSubmit = (formData, coordinates) => {
    const toastId = toast.loading('Actualizando base de datos')
    const input = {
      ...formData,
      [dictionary.location]: coordinates,
      id: data.id
    }
    mutate(
      '/api/orders',
      async () => {
        try {
          const response = await axios.patch('/api/orders', input)
          const plants = { previousPlants, newPlant }
          await axios.patch('/api/details', plants)
          toast.dismiss(toastId)
          toast.success('Guardado')
          return response.data
        } catch (error) {
          toast.dismiss(toastId)
          toast.error('Se ha presentado un error')
        }
      },
      {
        revalidate: true,
        rollbackOnError: true
      }
    ).then(() => {
      handleClose()
    })
  }

  const calculateDefaultValue = (plant, container, array) => {
    const defaultValue = array?.filter(pl => pl.plant === plant && pl.container === container)[0]
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

  const handleClose = () => {
    onClose()
    setNewPlant([])
    setPreviousPlants([])
    reset()
    setSelectedData(null)
  }

  const handleSearch = ({ target }) => {
    const { value } = target
    setQuery(value)
  }

  const filteredDataPlants = parsedData.data.filter(el => removeAccents(el[0]).includes(removeAccents(query)))

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
        <DrawerBody key={data}>
          <form id="edit-order" key={data} onSubmit={handleSubmit((data) => onSubmit(data, coordinates))}>
            <Tabs>
              <TabList>
                <Tab><Text as='b'>Información General</Text></Tab>
                <Tab><Text as='b'>Informes</Text></Tab>
                <Tab><Text as='b'>Actualizar Pedido</Text></Tab>
              </TabList>
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
                      <Text letterSpacing="wide">Fecha</Text>
                      <Input
                        type='date'
                        {...register(dictionary.date, {
                          value: data.date ? format(new Date(data.date).getTime(), 'yyyy-MM-dd') : '',
                          valueAsDate: true
                        })}
                      />
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Identificación</Text>
                      <Input type='text' {...register(dictionary.identifier)} />
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Teléfono de contacto</Text>
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
                        {...register(dictionary.canton, {
                          onChange: (e) => setCanton(e.target.value)
                        })}
                        defaultValue={data.canton}
                      >
                        {['Santo Domingo', 'La Concordia'].map(el =>
                          <option /* selected={data.canton === el} */ key={el} value={el}>{el}</option>
                        )}
                      </Select>
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Parroquia</Text>
                      <Select
                        placeholder='Seleccione una opción'
                        {...register(dictionary.parish)}
                        defaultValue={data.parish}
                      >
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
                </TabPanel>
                <TabPanel>
                  <Stack spacing={4}>
                    <Box fontSize="md">
                      <Text letterSpacing="wide">Subsidio o venta</Text>
                      <Select
                        placeholder='Seleccione una opción'
                        {...register(dictionary.subsidy)}
                        defaultValue={data.subsidy}
                      >
                        {['Subsidio', 'Venta'].map(el =>
                          <option /* selected={data.subsidy === el} */ key={el} value={el}>{el}</option>
                        )}
                      </Select>
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Tipo de beneficiario</Text>
                      <Select
                        placeholder='Seleccione una opción'
                        {...register(dictionary.typeBeneficiary)}
                        defaultValue={data.typeBeneficiary}
                      >
                        {typeBeneficiary.map(el =>
                          <option /* selected={data.typeBeneficiary === el} */ key={el} value={el}>{el}</option>
                        )}
                      </Select>
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Colaboradores</Text>
                      <Input type='text' {...register(dictionary.collaborators)} />
                    </Box>

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Supervivencia individuos</Text>
                      <Input type='number' {...register(dictionary.survival, {
                        valueAsNumber: true
                      })} />
                    </Box>

                  {/*   <Box fontSize="md">
                      <Text letterSpacing="wide">Fecha de medición</Text>
                      <Input
                        type='date'
                        {...register(dictionary.measurementDate, {
                          valueAsDate: true
                        })}
                      />
                    </Box> */}

                    <Box fontSize="md">
                      <Text letterSpacing="wide">Fecha de entrega</Text>
                      <Input
                        type='date'
                        {...register(dictionary.deliveryDate, {
                          valueAsDate: true
                        })}
                      />
                    </Box>

                  </Stack>
                </TabPanel>
                <TabPanel>
                  <Input marginY={2} placeholder='Buscar planta...' onChange={handleSearch} />
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
                        {filteredDataPlants.map(([plant, container, inventory], index) => (
                          <Tr key={plant + '-' + index}>
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
                                  max={inventory + calculateDefaultValue(plant, container, data?.details)}
                                  min={0}
                                  onInput={event => handlePlantsSelect(event, index, plant, container)}
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
                    <Button colorScheme='teal' type="submit" isLoading={isSubmitted}>Guardar</Button>
                  </DrawerFooter>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </form>
        </DrawerBody>
      </DrawerContent>
    </Drawer>

  )
}

OrderDialog.propTypes = {
  data: PropTypes.object,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  setSelectedData: PropTypes.func
}

export default OrderDialog
