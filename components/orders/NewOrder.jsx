import {
  Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, FormControl, Input, TableContainer, Table, Thead, Tbody, Tr, Td, FormHelperText, FormLabel, Stack, Select, DrawerCloseButton, Box
} from '@chakra-ui/react'
import axios from 'axios'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { useForm } from 'react-hook-form'
import { parseData } from '../../utils'
import { inventoryDictionary, dictionary } from '../../utils/orders/dictionary'
import { parishes } from '../../utils/complaints'
import { format, getYear, parseISO } from 'date-fns'
import { toast } from 'react-hot-toast'

// eslint-disable-next-line react/prop-types
export default function NewOrder ({ isOpen, onClose, btnRef }) {
  const [plants, setPlants] = useState([])
  const { data/* , error */ } = useSWR('/api/inventory', (url) => axios.get(url).then(res => res.data))
  const { data: dataPlants/* , error */ } = useSWR('/api/plants-list', (url) => axios.get(url).then(res => res.data))

  const { handleSubmit, register } = useForm({ mode: 'onBlur' })

  const handleAddNewOrder = (data) => {
    const details = plants.reduce((acc, plant) => {
      const match = dataPlants.find(p => p.Planta === plant.Planta && p.Contenedor === plant.Contenedor)
      if (!match) return acc
      return [...acc, { Planta: match.id, Cantidad: plant.Cantidad }]
    }, [])

    const input = {
      ...data,
      [dictionary.year]: getYear(parseISO(data.Fecha)),
      [dictionary.status]: 'Recibido',
      Plantas: details
    }

    console.log(input)
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

  const orderNumber = Math.floor(1000 + Math.random() * 9000)

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      finalFocusRef={btnRef}
      size={'lg'}
    >

      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Nueva Orden</DrawerHeader>
        <DrawerBody>
          <form style={{ display: 'flex', flexDirection: 'column', rowGap: '10px' }} onSubmit={handleSubmit(handleAddNewOrder)}>
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
                  <Input type="date" {...register('Fecha')} defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                </FormControl>
              </Box>
              <FormControl isRequired>
                <FormLabel>Nombre beneficiario</FormLabel>
                <Input type='text' {...register(dictionary.name)} />
              </FormControl>

              <Box display="flex" gap={6} alignItems="center">

                <FormControl isRequired>
                  <FormLabel>Cédula</FormLabel>
                  <Input type='number' {...register(dictionary.identifier)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Teléfono</FormLabel>
                  <Input type='tel' {...register(dictionary.phoneNumber)} />
                </FormControl>
              </Box>

              <FormControl isRequired>
                <FormLabel >Dirección</FormLabel>
                <Input type='text' {...register(dictionary.address)} />
              </FormControl>

              <FormControl>
                <FormLabel>Parroquia</FormLabel>
                <Select {...register(dictionary.parish)}>
                  {parishes.map(el =>
                    <option key={el} value={el}>{el}</option>
                  )}
                </Select>

              </FormControl>
              <FormControl>
                <FormLabel>Canton</FormLabel>
                <Select {...register(dictionary.canton)}>
                  {['Santo Domingo', 'La Concordia'].map(el =>
                    <option key={el} value={el}>{el}</option>
                  )}
                </Select>

              </FormControl>
            </Stack>
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
            <Button
              mt={4}
              colorScheme='teal'
              type='submit'
            >
              Submit
            </Button>
          </form>
        </DrawerBody>
      </DrawerContent>
    </Drawer >
  )
}
