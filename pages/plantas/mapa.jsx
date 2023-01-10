import { Box, Button, Input, Text } from '@chakra-ui/react'
import axios from 'axios'
import useSWR from 'swr'
import { dictionary } from '../../utils/orders/dictionary'
import { statusEnum } from '../../utils/orders/enum'
import { scaleLinear } from 'd3-scale'
import { max } from 'd3-array'
import Map from '../../components/map/index'
import useFilterByDate from '../../hooks/use-filtered-data'

export default function DeliveredMap () {
  const { data, error } = useSWR('/api/orders', (url) => axios.get(url).then(res => res.data))

  const delivered = (data || [])
    .filter(item => item[dictionary.status] === statusEnum.DELIVERED && item[dictionary.location])
    .map(item => {
      const total = (item.Detalle || []).reduce((acc, detail) => acc + (detail?.Cantidad || 0), 0)
      return {
        ...item,
        total
      }
    })

  const {
    startDate,
    endDate,
    currentDate,
    startDateChangeHandler,
    endDateChangeHandler,
    clearInputsClickHandler,
    filteredData
  } = useFilterByDate(delivered, '', dictionary.deliveryDate)

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando mapa...</Text>

  const scale = scaleLinear()
    .domain([0, max(delivered, d => d.total)])
    .range([25, 250])

  return (
    <Box h='calc(100vh)' pos="relative">
      <Box
        display="flex"
        alignItems="center"
        flexWrap="wrap"
        justifyContent="space-between"
        rowGap={4}
        columnGap={{ xl: 6 }}
        pos="absolute"
        zIndex={500}
        bg="white"
        top={0}
        right={0}
        px={4}
        py={2}
      >
        <Box display="flex" width={{ base: '45%', lg: '30%', xl: 'auto' }} alignItems="center" columnGap={1}>
          <Text flexShrink={0}>Desde :</Text>
          <Input type="date" value={startDate} max={currentDate} onChange={startDateChangeHandler} />
        </Box>
        <Box display="flex" width={{ base: '45%', lg: '30%', xl: 'auto' }} alignItems="center" columnGap={1}>
          <Text flexShrink={0}>Hasta :</Text>
          <Input type="date" value={endDate} max={currentDate} min={startDate} onChange={endDateChangeHandler} />
        </Box>
        <Button width={{ base: '100%', lg: '30%', xl: 'auto' }} colorScheme='blackAlpha' variant='outline' onClick={clearInputsClickHandler}>
          Restablecer filtros
        </Button>
      </Box>
      <Map center={[-0.254167, -79.1719]} zoom={15} scrollWheelZoom={false} style={{ height: '100%' }} zoomControl={false}>
        {({ TileLayer, Circle, ZoomControl }) => (
          <>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomright" />
            {(filteredData || []).map(item => (
              <Circle
                key={item.id}
                center={item[dictionary.location].split(', ').map(item => +item)}
                radius={scale(item.total)}
                color="#078930"
              />
            ))}
          </>
        )}
      </Map>
    </Box>
  )
}

DeliveredMap.getInitialProps = () => {
  return { fullWidth: true }
}
