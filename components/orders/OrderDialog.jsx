import { Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, FormControl, FormHelperText, Input, Select, Stack, Table, TableContainer, Tbody, Td, Text, Tfoot, Th, Thead, Tr } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import isEmpty from 'lodash.isempty'
import PropTypes from 'prop-types'
import { orderDetailDictionary, dictionary } from '../../utils/orders/dictionary'
import { useForm } from 'react-hook-form'
import { parishes } from '../../utils/complaints'
import useSWR, { mutate } from 'swr'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { group } from 'd3-array'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import validator from 'validator'

function OrderDialog ({ isOpen, onClose, data = {} }) {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [addPlantRow, setAddPlantRow] = useState(false)
  const [addedPlant, setAddedPlant] = useState({})
  const [container, setContainer] = useState([])
  const [selectedPlant, setSelectedPlant] = useState({})
  const [enableSave, setEnableSave] = useState(false)
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
      [dictionary.parish]: data.parish
    }
  })

  useEffect(() => {
    if (!data || isEmpty(data) || !data.details?.length) return
    const headers = Object.keys(data.details.at(0)).map(key => orderDetailDictionary[key])
    const rows = data.details.reduce((result, detail) => {
      return [...result, Object.values(detail)]
    }, [])
    setHeaders(headers)
    setRows(rows)
  }, [data])

  if (error || plantsError) return <p>Se ha presentado un error</p>
  if (!inventory) return null

  const groupedByName = Array.from(group(inventory, d => d.Planta))
  const names = groupedByName.map(([name]) => name)

  const onSubmit = (formData) => {
    const input = {
      ...formData,
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
  }

  const handleSelectPlant = (e) => {
    setAddedPlant({ Planta: e.target.value })
    setSelectedPlant({})
    setEnableSave(false)
    const match = inventory.filter(plant => plant.Planta === e.target.value)
    const containers = (match || []).map(item => item.Contenedor)
    setContainer(containers)
  }

  const handleSelectContainer = (e) => {
    setAddedPlant(prevState => ({
      ...prevState,
      Contenedor: e.target.value
    }))
    const match = inventory.find(item => item.Planta === addedPlant.Planta && e.target.value === item.Contenedor)
    setSelectedPlant(match)
  }

  const handleSelectQty = e => {
    const value = e.target.valueAsNumber || 0
    const isValid = validator.isInt(e.target.value, {
      min: 1,
      max: +selectedPlant.Inventario
    })
    setAddedPlant(prevState => ({
      ...prevState,
      Cantidad: value
    }))
    setEnableSave(isValid)
  }

  const saveDetails = () => {
    const match = allPlants.find(plant => addedPlant.Planta === plant.Planta && addedPlant.Contenedor === plant.Contenedor)
    const input = {
      Planta: match.id,
      Cantidad: addedPlant.Cantidad,
      Pedido: data.id
    }
    const op = axios.post('/api/details', input)
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
      console.log(selectedPlant)
      handleCancel()
    })
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
      <DrawerContent>
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
          <form id="edit-order" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              {data.name && (
                <Box fontSize="md">
                  <Text letterSpacing="wide">Nombre beneficiario</Text>
                  <Input type='text' {...register(dictionary.name)} />
                </Box>
              )}
              {data.identifier && (
                <Box fontSize="md">
                  <Text letterSpacing="wide">Identificación</Text>
                  <Input type='text' {...register(dictionary.identifier)} />
                </Box>
              )}
              {data.address && (
                <Box fontSize="md">
                  <Text letterSpacing="wide">Dirección</Text>
                  <Input type='text' {...register(dictionary.address)} />
                </Box>
              )}
              {data.phoneNumber && (
                <Box fontSize="md">
                  <Text letterSpacing="wide">Contacto</Text>
                  <Input {...register(dictionary.phoneNumber)} />
                </Box>
              )}
              {data.canton && (
                <Box fontSize="md">
                  <Text letterSpacing="wide">Cantón</Text>
                  <Select {...register(dictionary.canton)}>
                    {['Santo Domingo', 'La Concordia'].map(el =>
                      <option key={el} value={el}>{el}</option>
                    )}
                  </Select>
                </Box>
              )}
              {data.parish && (
                <Box fontSize="md">
                  <Text letterSpacing="wide">Parroquia</Text>
                  <Select {...register(dictionary.parish)}>
                    {parishes.map(el =>
                      <option key={el} value={el}>{el}</option>
                    )}
                  </Select>
                </Box>
              )}
            </Stack>
            <Text fontSize="md" mt={6}>Plantas</Text>
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
                  {addPlantRow && (
                    <Tr>
                      <Td>
                        <Stack direction={'row'}>
                          <Button aria-label='Cancelar' title='Cancelar' onClick={handleCancel} size="xs" colorScheme={'red'}>
                            <XMarkIcon width={16} height={16} />
                          </Button>
                          <Button aria-label='Guardar' title='Guardar' disabled={!enableSave} size="xs" colorScheme={'green'} onClick={saveDetails}>
                            <CheckIcon width={16} height={16} />
                          </Button>
                        </Stack>
                      </Td>
                      <Td>
                        <Select
                          onChange={handleSelectPlant}
                          name='Planta'
                          placeholder='Seleccione una opción'
                          isRequired
                        >
                          {names.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </Select>
                      </Td>
                      <Td>
                        {selectedPlant.Inventario && (
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={+selectedPlant.Inventario}
                              placeholder={selectedPlant.Inventario}
                              onChange={handleSelectQty}
                            />
                            <FormHelperText fontSize={'x-small'}>
                              <p>Hay {selectedPlant.Inventario} unidades disponibles</p>
                            </FormHelperText>
                          </FormControl>
                        )}
                      </Td>
                      <Td>
                        {container.length > 0 && addedPlant.Planta && (
                          <Select
                            onChange={handleSelectContainer}
                            name='Contenedor'
                            placeholder='Seleccione una opción'
                          >
                            {container.map(item => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </Select>
                        )}
                      </Td>
                      <Td>
                        {selectedPlant.Tipo && <p>{selectedPlant.Tipo}</p>}
                      </Td>
                    </Tr>
                  )}
                </Tbody>
                <Tfoot>
                  {!addPlantRow && (
                    <Tr>
                      <Td colSpan="5">
                        <Button variant={'link'} onClick={() => setAddPlantRow(true)}>
                          + Agregar
                        </Button>
                      </Td>
                    </Tr>
                  )}
                </Tfoot>
              </Table>
            </TableContainer>
          </form>
        </DrawerBody>
        <DrawerFooter>
          <Button variant='outline' mr={3} onClick={handleClose}>
            Cancelar
          </Button>
          <Button form="edit-order" colorScheme='blue' type="submit">Guardar</Button>
        </DrawerFooter>
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
