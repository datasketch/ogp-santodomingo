import {
  Button, Text, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, FormControl, Input, TableContainer, Table, Thead, Tbody, Tr, Td, FormHelperText, FormLabel, Stack, Select, DrawerCloseButton, Box, TabPanels, TabPanel, Tabs, TabList, Tab, Alert, AlertIcon
} from '@chakra-ui/react'
import axios from 'axios'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { useForm } from 'react-hook-form'
import { format, getYear, parseISO } from 'date-fns'
import { toast } from 'react-hot-toast'

import { parseData } from '../../utils'
import { inventoryDictionary, dictionary } from '../../utils/orders/dictionary'

import dynamic from 'next/dynamic'
import { useComplaintForm } from '../../hooks/use-complaint-form'
import { parishesPlants } from '../../utils/orders'

const Map = dynamic(() => import('../../components/Map'), {
  ssr: false
})

// eslint-disable-next-line react/prop-types
export default function NewOrder ({ isOpen, onClose, btnRef }) {
  const [plants, setPlants] = useState([])
  const [positionSlider, SetPositionSlider] = useState(0)
  const { data /* error */ } = useSWR('/api/inventory', (url) => axios.get(url).then(res => res.data))
  const { data: dataPlants /* error: errorPlants */ } = useSWR('/api/plants-list', (url) => axios.get(url).then(res => res.data))

  const { handleSubmit, register, reset, formState: { errors, isSubmitted, isValid } } = useForm({ mode: 'onBlur' })
  const { center, coordinates, setCoordinates } = useComplaintForm(data)

  const handleAddNewOrder = (data, coordinate) => {
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
    const op = axios.post('/api/orders', input)
    mutate(
      '/api/orders',
      () => toast.promise(op, {
        loading: 'Actualizando base de datos',
        success: () => 'Guardado',
        error: () => 'Se ha presentado un error'
      }),
      {
        revalidate: true
      })
    reset()
    onClose()
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
  const orderNumber = Math.floor(1000 + Math.random() * 9000)

  const handleTabsChange = (index) => {
    SetPositionSlider(index)
  }

  const handlePositionTab = ({ target }) => {
    if (target.textContent === 'Atras') return SetPositionSlider(+target.value)
    if (isValid) return SetPositionSlider(+target.value)
    toast.error('Campo(s) del formulario requeridos')
  }

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
              {positionSlider === 2 && <Tab><Text as='b' >Pedido</Text></Tab>}
            </TabList>
            <form action="post" style={{ display: 'flex', flexDirection: 'column', rowGap: '10px' }} onSubmit={handleSubmit((data) => handleAddNewOrder(data, coordinates))}>
              <TabPanels>
                <TabPanel>

                  <Stack dir="column" spacing={5} m={5}>
                    <Box display="flex" gap={6} alignItems="center">
                      <FormControl >
                        <FormLabel>Orden #{orderNumber}</FormLabel>
                        <Input type="number" {...register('Orden', {
                          valueAsNumber: true
                        })} value={orderNumber} hidden />
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
                      <Input type='text' {...register(dictionary.subsidy)} />
                      {errors[dictionary.subsidy] && <Alert status='error'>
                        <AlertIcon />
                        Este campo es requerido
                      </Alert>}
                    </FormControl>

                    <FormControl >
                      <FormLabel >Colaboradores</FormLabel>
                      <Input type='text' {...register(dictionary.collaborators)} />
                      {errors[dictionary.canton] && <Alert status='error'>
                        <AlertIcon />
                        Este campo es requerido
                      </Alert>}
                    </FormControl>

                    <FormControl >
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
                    </FormControl>
                    <FormControl >
                      <FormLabel >Fecha de medición</FormLabel>
                      <Input type='date' {...register(dictionary.measurementDate, { valueAsDate: true })} />
                      {errors[dictionary.measurementDate] && <Alert status='error'>
                        <AlertIcon />
                        Este campo es requerido
                      </Alert>}
                    </FormControl>

                    <FormControl >
                      <FormLabel >Actor</FormLabel>
                      <Input type='text' {...register(dictionary.actor)} />
                      {errors[dictionary.actor] && <Alert status='error'>
                        <AlertIcon />
                        Este campo es requerido
                      </Alert>}
                    </FormControl>
                    <Box justifyItems={'end'} display='flex' gap='2' mt={2}>
                      <Button type='button' value={0} onClick={handlePositionTab}>Atras</Button>
                      <Button type='button' value={2} onClick={e => handlePositionTab(e, 'back')}>Siguiente</Button>
                    </Box>
                  </Stack>
                </TabPanel>
                <TabPanel>
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
