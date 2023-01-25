import { Box, Input, Heading, Text } from '@chakra-ui/react'
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
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState({ since: '', until: '' })
  const [selectedTransplantingDate, setSelectedTransplantingDate] = useState({ sinceTrans: '', untilTrans: '' })
  const { data, error } = useSWR(['/api/inventory', selectedDeliveryDate, selectedTransplantingDate], (url, selectedDeliveryDate, selectedTransplantingDate) =>
    axios.get(url + '?' + queryString.stringify(({ ...selectedDeliveryDate, ...selectedTransplantingDate }))).then(res => res.data))
  const currentDate = format(new Date(), 'yyyy-MM-dd')

  const handleChange = (type, e) => {
    if (type === 'since') {
      setSelectedDeliveryDate(prev => ({ ...prev, since: e.target.value }))
    }
    if (type === 'until') {
      setSelectedDeliveryDate(prev => ({ ...prev, until: e.target.value }))
    }
    if (type === 'sinceTrans') {
      setSelectedTransplantingDate(prev => ({ ...prev, sinceTrans: e.target.value }))
    }
    if (type === 'untilTrans') {
      setSelectedTransplantingDate(prev => ({ ...prev, untilTrans: e.target.value }))
    }
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

          <Box>
            <Text flexShrink={0}>Fecha de entrega </Text>
            <Box display={'flex'} gap={2}>
              <Box alignItems="center" display="flex" columnGap={1}>
                <Text flexShrink={0}>desde : </Text>
                <Input type="date" value={selectedDeliveryDate.since} max={currentDate} onChange={(e) => handleChange('since', e)} />
              </Box>
              <Box alignItems="center" display="flex" columnGap={1}>
                <Text flexShrink={0}>hasta : </Text>
                <Input type="date" value={selectedDeliveryDate.until} max={currentDate} onChange={(e) => handleChange('until', e)} />
              </Box>
            </Box>
          </Box>

          <Box >
            <Text flexShrink={0}>Fecha de trasplante </Text>
            <Box display={'flex'} gap={2}>
              <Box alignItems="center" display="flex" columnGap={1}>
                <Text flexShrink={0}>desde : </Text>
                <Input type="date" value={selectedTransplantingDate.since} max={currentDate} onChange={(e) => handleChange('sinceTrans', e)} />
              </Box>
              <Box alignItems="center" display="flex" columnGap={1}>
                <Text flexShrink={0}>hasta : </Text>
                <Input type="date" value={selectedTransplantingDate.until} max={currentDate} onChange={(e) => handleChange('untilTrans', e)} />
              </Box>
            </Box>
          </Box>

          <Box>
            <Text flexShrink={0}>&nbsp;</Text>
            <DownloadCSV data={data} label='inventario' />
          </Box>

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
