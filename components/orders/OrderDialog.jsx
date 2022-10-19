import { Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Input, Select, Stack, Table, TableContainer, Tbody, Td, Text, Tfoot, Th, Thead, Tr } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import isEmpty from 'lodash.isempty'
import PropTypes from 'prop-types'
import { orderDetailDictionary, dictionary } from '../../utils/orders/dictionary'
import { useForm } from 'react-hook-form'
import { parishes } from '../../utils/complaints'
import { mutate } from 'swr'
import axios from 'axios'
import { toast } from 'react-hot-toast'

function OrderDialog ({ isOpen, onClose, data = {} }) {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])

  console.log(data)

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

  const onSubmit = (formData) => {
    console.log(data)
    console.log(formData)
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

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
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
              <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ lg: 'center' }} rowGap={4}>
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
              </Box>
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
                </Tbody>
                <Tfoot>
                  <Tr>
                    <Td colSpan="5">
                      <Button variant={'link'}>
                        + Agregar
                      </Button>
                    </Td>
                  </Tr>
                </Tfoot>
              </Table>
            </TableContainer>
            <Button colorScheme='blue' type="submit">Guardar</Button>
          </form>
        </DrawerBody>
        <DrawerFooter>
          <Button variant='outline' mr={3} onClick={onClose}>
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
