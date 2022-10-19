import { Box, Heading, Text } from '@chakra-ui/react'
import axios from 'axios'
import { Grid } from 'gridjs-react'
import useSWR from 'swr'
import Layout from '../../components/orders/Layout'
import { esES } from 'gridjs/l10n'
import 'gridjs/dist/theme/mermaid.css'
import { parseData } from '../../utils'

function InventoryPage () {
  const { data, error } = useSWR('/api/inventory', (url) => axios.get(url).then(res => res.data))

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando inventario.</Text>

  return (
    <Box position="relative">
      <Heading color="gray.700">Inventario</Heading>
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
