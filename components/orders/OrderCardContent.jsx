import { Badge, Box, Stack, Text } from '@chakra-ui/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import PropTypes from 'prop-types'

function OrderCardContent ({ data }) {
  return (
    <Stack spacing={2} alignItems="flex-start">
      {data.order && (
        <Box>
          <Text fontSize="xs" letterSpacing="wide">Orden</Text>
          <Text fontSize="small" fontWeight="semibold">#{data.order}</Text>
        </Box>
      )}
      {data.name && (
        <Box>
          <Text fontSize="xs" letterSpacing="wide">Nombre beneficiario</Text>
          <Text fontSize="small" fontWeight="semibold">{data.name}</Text>
        </Box>
      )}
      {(data.date || data.details) && (
        <Stack w="full" direction={{ base: 'column', lg: 'row' }} justify="space-between" align="flex-start">
          {data.date && (
            <Box>
              <Text fontSize="xs" letterSpacing="wide">Fecha</Text>
              <Text fontSize="small" fontWeight="semibold">{format(new Date(data.date), 'MMMM dd, yyyy', { locale: es })}</Text>
            </Box>
          )}
          {data.details && data.details.length && (
            <Box data-details={JSON.stringify(data.details)}>
              <Text fontSize="xs" letterSpacing="wide">Total plantas</Text>
              <Badge fontSize="xx-small" rounded="2xl" py={1} px={2}>
                {data.details.reduce((acc, item) => acc + item.qty, 0)}
              </Badge>
            </Box>
          )}
        </Stack>
      )}
      {data.canton && (
        <Box>
          <Text fontSize="xs" letterSpacing="wide">Cantón</Text>
          <Text fontSize="small" fontWeight="semibold">{data.canton}</Text>
        </Box>
      )}
      {data.parish && (
        <Box>
          <Text fontSize="xs" letterSpacing="wide">Parroquia</Text>
          <Text fontSize="small" fontWeight="semibold">{data.parish}</Text>
        </Box>
      )}
    </Stack>
  )
}

OrderCardContent.propTypes = {
  data: PropTypes.object
}

export default OrderCardContent
