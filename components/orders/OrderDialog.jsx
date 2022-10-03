import { Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Stack, Table, TableContainer, Tbody, Td, Text, Tfoot, Th, Thead, Tr } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import isEmpty from 'lodash.isempty'
import PropTypes from 'prop-types'
import { orderDetailDictionary } from '../../utils/orders/dictionary'

function OrderDialog ({ isOpen, onClose, data = {} }) {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (!data || isEmpty(data) || !data.details?.length) return
    const headers = Object.keys(data.details.at(0)).map(key => orderDetailDictionary[key])
    const rows = data.details.reduce((result, detail) => {
      return [...result, Object.values(detail)]
    }, [])
    setHeaders(headers)
    setRows(rows)
  }, [data])

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
        <DrawerHeader>Detalle orden #{data.order}</DrawerHeader>
        <DrawerBody>
          <Stack spacing={4}>
            {data.name && (
              <Box fontSize="md">
                <Text letterSpacing="wide">Nombre beneficiario</Text>
                <Text fontWeight="semibold">{data.name}</Text>
              </Box>
            )}
            {data.canton && (
              <Box fontSize="md">
                <Text letterSpacing="wide">Cantón</Text>
                <Text fontWeight="semibold">{data.canton}</Text>
              </Box>
            )}
            {data.parish && (
              <Box fontSize="md">
                <Text letterSpacing="wide">Parroquia</Text>
                <Text fontWeight="semibold">{data.parish}</Text>
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
        </DrawerBody>
        <DrawerFooter>
          <Button variant='outline' mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme='blue'>Guardar</Button>
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
