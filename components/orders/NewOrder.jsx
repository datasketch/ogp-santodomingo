/* eslint-disable react/prop-types */
import {
  Button, Text, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, FormControl, Input, TableContainer, Table, Thead, Tbody, Tr, Td, FormHelperText, FormLabel, Stack, Select, DrawerCloseButton, Box, TabPanels, TabPanel, Tabs, TabList, Tab, Alert, AlertIcon, FormErrorMessage
} from '@chakra-ui/react'
import axios from 'axios'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { useForm } from 'react-hook-form'
import { format, getYear, parseISO } from 'date-fns'
import { toast } from 'react-hot-toast'

import { parseData } from '../../utils'
import { inventoryDictionary, dictionary, typeBeneficiary } from '../../utils/orders/dictionary'

import dynamic from 'next/dynamic'
import { useComplaintForm } from '../../hooks/use-complaint-form'
import { parishesPlants, removeAccents } from '../../utils/orders'

const Map = dynamic(() => import('../../components/Map'), {
  ssr: false
})

export default function NewOrder ({ isOpen, onClose, btnRef, orders }) {
  const [plants, setPlants] = useState([])
  const [positionSlider, SetPositionSlider] = useState(0)
  const [query, setQuery] = useState('')
  const { data /* error */ } = useSWR('/api/inventory', (url) => axios.get(url).then(res => res.data))
  const { data: dataPlants /* error: errorPlants */ } = useSWR('/api/plants-list', (url) => axios.get(url).then(res => res.data))
  const numberOrders = orders?.map(({ [dictionary.order]: orden }) => orden)

  const { handleSubmit, register, reset, formState: { errors, isSubmitted, isValid } } = useForm({ mode: 'onBlur' })
  const { center, coordinates, setCoordinates } = useComplaintForm(data)

  const handleAddNewOrder = (data, coordinate) => {
    const toastId = toast.loading('Actualizando base de datos')
    const details = plants.reduce((acc, plant) => {
      const match = dataPlants.find(p => p.Planta === plant.Planta && p.Contenedor === plant.Contenedor)
      if (!match) return acc
      return [...acc, { Planta: match.id, Cantidad: plant.Cantidad }]
    }, [])

    const input = {
      ...data,
      [dictionary.location]: coordinate,
      [dictionary.year]: getYear(parseISO(data.Fecha)),
      [dictionary.status]: 'Recibido',
      Plantas: details
    }
    mutate(
      '/api/orders',
      async (cachedValue) => {
        try {
          await axios.post('/api/orders', input)
          toast.dismiss(toastId)
          toast.success('Guardado')
        } catch (error) {
          toast.dismiss(toastId)
          toast.error('Se ha presentado un error')
        }
      },
      {
        revalidate: true
      }).then(() => {
      reset()
      onClose()
    })
  }

  const parsedData = parseData((data || []), {
    omit: [
      inventoryDictionary.unitsReadyForDelivery,
      inventoryDictionary.unitsDelivered,
      inventoryDictionary.type
    ]
  })

  const handlePlantsSelect = (event, index, plant, container) => {
    const plantObject = {
      id: index,
      Planta: plant,
      Contenedor: container,
      Cantidad: event.target.valueAsNumber
    }
    const matchIndex = plants.findIndex(plant => plant.id === index)
    if (matchIndex === -1) {
      setPlants(prevState => (
        [...prevState, plantObject]
      ))
      return
    }
    const state = [
      ...plants.slice(0, matchIndex),
      plantObject,
      ...plants.slice(matchIndex + 1)
    ]
    setPlants(state)
  }
  const [canton, setCanton] = useState('')
  // const orderNumber = Math.floor(1000 + Math.random() * 9000)

  const handleTabsChange = (index) => {
    SetPositionSlider(index)
  }

  const handlePositionTab = ({ target }) => {
    if (target.textContent === 'Atras') return SetPositionSlider(+target.value)
    if (isValid) return SetPositionSlider(+target.value)
    toast.error('Campo(s) del formulario requeridos')
  }

  const valideNumOrder = (order) => {
    const val = !numberOrders.includes(order)
    return val
  }

  const handleSearch = ({ target }) => {
    const { value } = target
    setQuery(value)
  }

  const filteredData = parsedData.data.filter(el => removeAccents(el[0]).includes(removeAccents(query)))

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      finalFocusRef={btnRef}
      size={'xl'}
    >

      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Nueva Orden</DrawerHeader>
        <DrawerBody>
          <Tabs index={positionSlider} onChange={handleTabsChange}>
            <TabList>
              {positionSlider === 0 && <Tab><Text as='b' >Información General</Text></Tab>}
              {positionSlider === 1 && <Tab><Text as='b'>Informes</Text></Tab>}
              {positionSlider === 2 && <Tab>
                <Text as='b' >Pedido</Text>

              </Tab>}
            </TabList>
            <form action="post" style={{ display: 'flex', flexDirection: 'column', rowGap: '10px' }} onSubmit={handleSubmit((data) => handleAddNewOrder(data, coordinates))}>
              <TabPanels>
                <TabPanel>

                  <Stack dir="column" spacing={5} m={5}>
                    <Box display="flex" gap={6} alignItems="center">
                      <FormControl
                        isInvalid={errors && errors[dictionary.order]} >
                        <FormLabel>Orden #</FormLabel>
                        <Input type="number" {...register(dictionary.order, {
                          valueAsNumber: true,
                          validate: v => valideNumOrder(v) || 'Numero de orden ya existente'
                        })} />
                        {errors && errors[dictionary.order] && (
                          <FormErrorMessage>
                            {errors[dictionary.order].message}
                          </FormErrorMessage>
                        )
                        }
                      </FormControl>
                      <FormControl >
                        <FormLabel>Fecha</FormLabel>
                        <Input type="date" {...register('Fecha')} defaultValue={format(new Date(), 'yyyy-MM-dd')} />                      </FormControl>
                    </Box>
                    <FormControl isRequired>
                      <FormLabel>Nombre beneficiario</FormLabel>
                      <Input type='text' {...register(dictionary.name, { required: 'Este Campo es requerido' })} />
                      {errors[dictionary.name] && <Alert status='error'>
                        <AlertIcon />
                        {errors[dictionary.name].message}
                      </Alert>}
                    </FormControl>
                    <Box display="flex" gap={6} alignItems="center">
                      <FormControl isRequired>
                        <FormLabel>Cédula</FormLabel>
                        <Input type='number' {...register(dictionary.identifier, { required: 'Este Campo es requerido' })} />
                        {errors[dictionary.identifier] && <Alert status='error'>
                          <AlertIcon />
                          {errors[dictionary.identifier].message}
                        </Alert>}
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Teléfono</FormLabel>
                        <Input type='tel' {...register(dictionary.phoneNumber, { required: 'Este Campo es requerido' })} />
                        {errors[dictionary.phoneNumber] && <Alert status='error'>
                          <AlertIcon />
                          {errors[dictionary.phoneNumber].message}
                        </Alert>}
                      </FormControl>
                    </Box>
                    <FormControl isRequired>
                      <FormLabel >Dirección</FormLabel>
                      <Input type='text' {...register(dictionary.address, { required: 'Este Campo es requerido' })} />
                      {errors[dictionary.address] && <Alert status='error'>
                        <AlertIcon />
                        {errors[dictionary.address].message}
                      </Alert>}
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Cantón</FormLabel>
                      <Select
                        placeholder='Seleccione una opción'
                        onInput={e => setCanton(e.target.value)}
                        {...register(dictionary.canton, { required: true })}
                      >
                        {['Santo Domingo', 'La Concordia'].map(el =>
                          <option key={el} value={el}>{el}</option>
                        )}
                      </Select>
                      {errors[dictionary.canton] && <Alert status='error'>
                        <AlertIcon />
                        Seleccione una opción
                      </Alert>}
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel >Parroquia</FormLabel>
                      <Select
                        placeholder='Seleccione una opción'
                        {...register(dictionary.parish, { required: true })}>
                        {parishesPlants[canton]?.map(el =>
                          <option key={el} value={el}>{el}</option>
                        )}
                      </Select>
                      {errors[dictionary.parish] && <Alert status='error'>
                        <AlertIcon />
                        Seleccione una opción
                      </Alert>}
                    </FormControl>

                    <FormControl>
                      <FormLabel>Ubicación</FormLabel>
                      <Map
                        center={center}
                        onMarkerMove={(coords) => {
                          const { lat, lng } = coords
                          setCoordinates(`${lat}, ${lng}`)
                        }}
                      />
                    </FormControl>
                    <Box justifyItems={'end'}>
                      <Button type='button' value={1} onClick={e => handlePositionTab(e)} >Siguiente</Button>
                    </Box>
                  </Stack>
                </TabPanel>
                <TabPanel>
                  <Stack dir="column" spacing={5} m={5}>
                    <FormControl >
                      <FormLabel >Subsidio o venta</FormLabel>
                      {/* <Input type='text' {...register(dictionary.subsidy)} /> */}
                      <Select
                        placeholder='Seleccione una opción'
                        {...register(dictionary.subsidy)}>
                        {['Subsidio', 'Venta'].map(el =>
                          <option key={el} value={el}>{el}</option>
                        )}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel >Tipo de Beneficiario</FormLabel>
                      <Select
                        placeholder='Seleccione una opción'
                        {...register(dictionary.typeBeneficiary)}>
                        {typeBeneficiary.map(el =>
                          <option key={el} value={el}>{el}</option>
                        )}
                      </Select>
                      {/* {errors[dictionary.typeBeneficiary] && <Alert status='error'>
                        <AlertIcon />
                        Seleccione una opción
                      </Alert>} */}
                    </FormControl>

                    <FormControl >
                      <FormLabel >Colaboradores</FormLabel>
                      <Input type='number' {...register(dictionary.collaborators, { valueAsNumber: true })} />
                      {errors[dictionary.collaborators] && <Alert status='error'>
                        <AlertIcon />
                        Este campo es requerido
                      </Alert>}
                    </FormControl>

                    {/* <FormControl >
                      <FormLabel >Supervivencia individuos</FormLabel>
                      <Input type='number' {...register(dictionary.survival, {
                        min: 0,
                        valueAsNumber: true
                      })}
                        min={0} />
                      {errors[dictionary.survival] && <Alert status='error'>
                        <AlertIcon />
                        Este campo es requerido
                      </Alert>}
                    </FormControl> */}
                    <FormControl >
                      <FormLabel >Fecha de medición</FormLabel>
                      <Input type='date' {...register(dictionary.measurementDate, { valueAsDate: true })} />
                      {errors[dictionary.measurementDate] && <Alert status='error'>
                        <AlertIcon />
                        Este campo es requerido
                      </Alert>}
                    </FormControl>

                    {/* <FormControl >
                      <FormLabel >Actor</FormLabel>
                      <Input type='text' {...register(dictionary.actor)} />
                      {errors[dictionary.actor] && <Alert status='error'>
                        <AlertIcon />
                        Este campo es requerido
                      </Alert>}
                    </FormControl> */}
                    <Box justifyItems={'end'} display='flex' gap='2' mt={2}>
                      <Button type='button' value={0} onClick={handlePositionTab}>Atras</Button>
                      <Button type='button' value={2} onClick={e => handlePositionTab(e, 'back')}>Siguiente</Button>
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
                            <th key={column}>{column === 'Inventario' ? 'Cantidad' : column}</th>
                          ))}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredData.map(([plant, container, inventory], index) => (
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
                                  defaultValue={0}
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
                  <Box justifyItems={'end'} display='flex' gap='2' mt={4} justifyContent='space-between'>
                    <Button type='button' value={1} onClick={e => handlePositionTab(e, 'back')}>Atras</Button>
                    <Button
                      colorScheme='teal'
                      type='submit'
                      isDisabled={plants.length === 0}
                      isLoading={isSubmitted}
                    >
                      Enviar
                    </Button>

                  </Box>

                </TabPanel>
              </TabPanels>
            </form>
          </Tabs>
        </DrawerBody>
      </DrawerContent >
    </Drawer >
  )
}
