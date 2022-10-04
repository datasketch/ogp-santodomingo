import { Box, Stack, Text } from '@chakra-ui/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import PropTypes from 'prop-types'

function PlantCardContent ({ data = {} }) {
  return (
    <Stack spacing={2} alignItems="flex-start">
      {data.plant && (
        <Box>
          <Text fontSize="xs" letterSpacing="wide">Planta</Text>
          <Text fontSize="small" fontWeight="semibold">{data.plant}</Text>
        </Box>
      )}
      {data.qty && (
        <Box>
          <Text fontSize="xs" letterSpacing="wide">Cantidad</Text>
          <Text fontSize="small" fontWeight="semibold">{new Intl.NumberFormat('es-EC').format(data.qty)}</Text>
        </Box>
      )}
      {data.type && (
        <Box>
          <Text fontSize="xs" letterSpacing="wide">Tipo</Text>
          <Text fontSize="small" fontWeight="semibold">{data.type}</Text>
        </Box>
      )}
      {data.container && (
        <Box>
          <Text fontSize="xs" letterSpacing="wide">Contenedor</Text>
          <Text fontSize="small" fontWeight="semibold">{data.container}</Text>
        </Box>
      )}
      {data.deliveryDate && (
        <Box>
          <Text fontSize="xs" letterSpacing="wide">Fecha de entrega</Text>
          <Text fontSize="small" fontWeight="semibold">{format(new Date(data.deliveryDate), 'MMMM dd, yyyy', { locale: es })}</Text>
        </Box>
      )}
      {data.transplantDate && (
        <Box>
          <Text fontSize="xs" letterSpacing="wide">Fecha de entrega</Text>
          <Text fontSize="small" fontWeight="semibold">{format(new Date(data.transplantDate), 'MMMM dd, yyyy', { locale: es })}</Text>
        </Box>
      )}
    </Stack>
  )
}

PlantCardContent.propTypes = {
  data: PropTypes.object
}

export default PlantCardContent
