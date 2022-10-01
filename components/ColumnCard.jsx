import { Badge, Box, Stack, Text } from '@chakra-ui/react'
import PropTypes from 'prop-types'
import { useDrag } from 'react-dnd'
import { sourceEnum } from '../utils'
import { format } from 'date-fns'

const colorScheme = {
  [sourceEnum.CITIZEN]: 'orange',
  [sourceEnum.OFFICER]: 'pink'
}

function ColumnCard ({ color = 'white', data }) {
  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: 'card',
      item: {
        id: data.id,
        status: data.complaintStatus
      },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1
      })
    })
  )
  return (
    <Box
      as="div"
      role="group"
      rounded="lg"
      p={4}
      boxShadow="lg"
      cursor="grab"
      minW={200}
      bgColor="white"
      ref={dragRef}
      style={{ opacity }}
      border="1px"
      borderColor="transparent"
      position="relative"
      _hover={{
        borderColor: 'blackAlpha.300'
      }}
    >
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
                <Text fontSize="small" fontWeight="semibold">{format(new Date(data.complaintDate), 'MMMM dd, yyyy')}</Text>
              </Box>
            )}
            {data.complaintType && (
              <Box>
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
    </Box>
  )
}

ColumnCard.propTypes = {
  data: PropTypes.object,
  color: PropTypes.string
}

export default ColumnCard
