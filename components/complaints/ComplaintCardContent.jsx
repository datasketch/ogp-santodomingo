import { Badge, Box, Stack, Text } from '@chakra-ui/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import PropTypes from 'prop-types'
import { sourceEnum } from '../../utils/complaints/enum'

const colorScheme = {
  [sourceEnum.CITIZEN]: 'orange',
  [sourceEnum.OFFICER]: 'pink'
}

function ComplaintCardContent ({ data }) {
  return (
    <>
      {data.source && (
        <Badge
          bg={colorScheme[data.source]}
          fontSize="xx-small"
          rounded="2xl"
          py={1}
          px={2}
          position="absolute"
          top={4}
          right={4}
        >{data.source}</Badge>
      )}
      <Stack spacing={2} alignItems="flex-start">
        {data.fullName && (
          <Box>
            <Text fontSize="xs" letterSpacing="wide">Nombres y apellidos</Text>
            <Text fontSize="small" fontWeight="semibold">{data.fullName}</Text>
          </Box>
        )}
        {data.companyName && (
          <Box>
            <Text fontSize="xs" letterSpacing="wide">Razón Social</Text>
            <Text fontSize="small" fontWeight="semibold">{data.companyName}</Text>
          </Box>
        )}
        {(data.complaintType || data.complaintDate) && (
          <Stack w="full" direction={{ base: 'column', lg: 'row' }} justify="space-between" align="flex-start">
            {data.complaintDate && (
              <Box>
                <Text fontSize="xs" letterSpacing="wide">Fecha de denuncia</Text>
                <Text fontSize="small" fontWeight="semibold">{format(new Date(data.complaintDate), 'MMMM dd, yyyy', { locale: es })}</Text>
              </Box>
            )}
            {data.complaintType && (
              <Box textAlign={data.complaintDate ? 'end' : 'start'}>
                <Text fontSize="xs" letterSpacing="wide">Tipo de denuncia</Text>
                <Badge fontSize="xx-small" rounded="2xl" py={1} px={2}>
                  {data.complaintType}
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
    </>
  )
}

ComplaintCardContent.propTypes = {
  data: PropTypes.object
}

export default ComplaintCardContent
