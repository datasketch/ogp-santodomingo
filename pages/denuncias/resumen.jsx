import { Badge, Box, Heading, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react'
import Layout from '../../components/complaints/Layout'
import { Grid } from 'gridjs-react'
import 'gridjs/dist/theme/mermaid.css'
import useSWR from 'swr'
import axios from 'axios'
import { group } from 'd3-array'
import { esES } from 'gridjs/l10n'
import { dictionary } from '../../utils/complaints/dictionary'
import { parseData } from '../../utils'

function Summary () {
  const { data, error } = useSWR('/api/complaints', (url) => axios.get(url).then(res => res.data))

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando resumenes...</Text>

  const byStatus = Array.from(group(data, d => d[dictionary.complaintStatus]))
  const byType = Array.from(group(data, d => d[dictionary.source]))

  return (
    <>
      <Tabs>
        <TabList>
          <Tab>Resumen por estado de la denuncia</Tab>
          <Tab>Resumen por tipo</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Stack spacing={12}>
              {data.length && byStatus.map(([status, data]) => (
                <Box key={status}>
                  <Stack direction="row">
                    <Heading size="md">
                      {status}
                    </Heading>
                    <Badge colorScheme="green" size="lg" px={2} py={1} rounded="lg">{data.length}</Badge>
                  </Stack>
                  <Grid
                    {...parseData(data, {
                      omit: [dictionary.id, dictionary.createdAt, dictionary.updatedAt, dictionary.complaintStatus]
                    })}
                    language={esES}
                    search
                    sort
                    autoWidth
                  />
                </Box>
              ))}
            </Stack>
          </TabPanel>
          <TabPanel>
            <Stack spacing={12}>
              {byType.map(([status, data]) => (
                <Box key={status}>
                  <Stack direction="row">
                    <Heading size="md">
                      {status}
                    </Heading>
                    <Badge colorScheme="green" size="lg" px={2} py={1} rounded="lg">{data.length}</Badge>
                  </Stack>
                  <Grid
                    {...parseData(data, {
                      omit: [dictionary.id, dictionary.createdAt, dictionary.updatedAt, dictionary.source]
                    })}
                    language={esES}
                    search
                    autoWidth
                    sort
                  />
                </Box>
              ))}
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  )
}

Summary.getLayout = function getLayout (page) {
  return (
    <Layout>
      {page}
    </Layout>
  )
}

export default Summary
