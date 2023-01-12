import { Box, Heading, Input, Text } from '@chakra-ui/react'
import axios from 'axios'
import { Grid } from 'gridjs-react'
import useSWR from 'swr'
import Layout from '../../components/orders/Layout'
import { esES } from 'gridjs/l10n'
import 'gridjs/dist/theme/mermaid.css'
import { parseData } from '../../utils'
import DownloadCSV from '../../components/DownloadCSV'
import { format } from 'date-fns'
import { useState } from 'react'
import queryString from 'query-string'

function InventoryPage () {
  const [selectedDate, setSelectedDate] = useState('')
  const { data, error } = useSWR(['/api/inventory', selectedDate], (url, selectedDate) => axios.get(url + '?' + queryString.stringify({ filter: selectedDate })).then(res => res.data))
  const currentDate = format(new Date(), 'yyyy-MM-dd')

  const handleChange = (e) => {
    setSelectedDate(e.target.value)
  }

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando inventario.</Text>

  return (
    <Box position="relative">
      <Box display={'flex'} justifyContent='space-between'>
        <Heading color="gray.700">
          Inventario
        </Heading>
        <Box display="flex" columnGap={4}>
          <Box alignItems="center" display="flex" columnGap={1}>
            <Text flexShrink={0}>Fecha de entrega (hasta): </Text>
            <Input type="date" value={selectedDate} max={currentDate} onChange={handleChange} />
          </Box>
          <DownloadCSV data={data} label='inventario' />
        </Box>
      </Box>
      <Grid
        {...parseData(data)}
        language={esES}
        height="800px"
        search
        sort
        fixedHeader
        autoWidth={false}
      />
    </Box>
  )
}

InventoryPage.getLayout = function getLayout (page) {
  return (
    <Layout>
      {page}
    </Layout>
  )
}

export default InventoryPage
