import { Box, Heading, Text } from '@chakra-ui/react'
import Layout from '../../components/orders/Layout'
import useSWR from 'swr'
import axios from 'axios'
import { dictionary } from '../../utils/orders/dictionary'
import { statusEnum } from '../../utils/orders/enum'
import { Grid } from 'gridjs-react'
import { parseData } from '../../utils'
import 'gridjs/dist/theme/mermaid.css'
import { esES } from 'gridjs/l10n'
import { format } from 'date-fns'
import DownloadCSV from '../../components/DownloadCSV'

function ReportsPlantsPage () {
  const { data, error } = useSWR('/api/orders', (url) => axios.get(url).then(res => res.data))

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando reporte de plantas entregadas.</Text>

  const dataDelivered = data
    .filter((el) => el[dictionary.status] === statusEnum.DELIVERED)
    .map(plant => ({ ...plant, 'Total de plantas': plant.Detalle.reduce((acc, p) => acc + p.Cantidad, 0) }))

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
  return (
    <Box position="relative">
      <Box display={'flex'} justifyContent='space-between'>
        <Heading color="gray.700" >Plantas Entregadas
        </Heading>
         <DownloadCSV data={dataDelivered} label={'reporte_' + format(new Date(), 'mm_dd_yyyy')} />
      </Box>
      <Grid
        {...parseData(dataDelivered, { omit })}
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
