import { Box, Button, Heading, Input, Text } from '@chakra-ui/react'
import Layout from '../../components/orders/Layout'
import useSWR from 'swr'
import axios from 'axios'
import { dictionary, growingPlantsDictionary as dict } from '../../utils/orders/dictionary'
import { statusEnum } from '../../utils/orders/enum'
import { Grid } from 'gridjs-react'
import { parseData } from '../../utils'
import 'gridjs/dist/theme/mermaid.css'
import { esES } from 'gridjs/l10n'
import { format } from 'date-fns'
import DownloadCSV from '../../components/DownloadCSV'
import useFilterByDate from '../../hooks/use-filtered-data'

function ReportsPlantsPage () {
  const omit = ['updated_at',
    'created_at',
    'Supervivencia individuos',
    'Subsidio o venta',
    'Fecha medición',
    'Cantón',
    'Fecha',
    'Año',
    'Colaboradores',
    'Actor',
    'Detalle',
    'id'
  ]

  const { data, error } = useSWR('/api/orders', (url) => axios.get(url).then(res => res.data))

  const dataDelivered = data?.filter((el) => el[dictionary.status] === statusEnum.DELIVERED)
    .map(plant => ({ ...plant, 'Total de plantas': plant.Detalle.reduce((acc, p) => acc + p.Cantidad, 0) }))

  const {
    startDate,
    endDate,
    currentDate,
    startDateChangeHandler,
    endDateChangeHandler,
    clearInputsClickHandler,
    filteredData
  } = useFilterByDate(dataDelivered, '', dict.deliveryDate)

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando reporte de plantas entregadas.</Text>

  return (
    <Box position="relative">
      <Box display={'flex'} justifyContent='space-between'>
        <Heading color="gray.700" >Plantas Entregadas
        </Heading>
        <Box display="flex" alignContent={'center'} gap={4} flexDirection={{ base: 'column', lg: 'row' }}>
          <Box marginY={'auto'}>
            <Text >&nbsp;</Text>
            <DownloadCSV data={filteredData} label={'reporte_' + format(new Date(), 'mm_dd_yyyy')} />
          </Box>
          <Box>
            <Text flexShrink={0}>Desde :</Text>
            <Input type="date" value={startDate} max={currentDate} onChange={startDateChangeHandler} />
          </Box>
          <Box>
            <Text flexShrink={0}>Hasta :</Text>
            <Input type="date" value={endDate} max={currentDate} min={startDate} onChange={endDateChangeHandler} />
          </Box>
          <Button width={{ base: '100%', lg: '30%', xl: 'auto' }} colorScheme='blackAlpha' variant='outline' alignSelf={{ lg: 'self-end' }} onClick={clearInputsClickHandler}>
            Restablecer filtros
          </Button>
        </Box>
      </Box>
      <Grid
        {...parseData(filteredData, { omit })}
        language={esES}
        height="800px"
        search
        sort
        fixedHeader
        autoWidth={false}
        pagination={{
          enabled: true,
          limit: 20
        }}
      />
    </Box>
  )
}
ReportsPlantsPage.getLayout = function getLayout (page) {
  return (
    <Layout>
      {page}
    </Layout>
  )
}
export default ReportsPlantsPage
