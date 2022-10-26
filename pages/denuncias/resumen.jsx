import { Box, Button, Heading, Input, Text } from '@chakra-ui/react'
import Layout from '../../components/complaints/Layout'
import { Grid } from 'gridjs-react'
import useSWR from 'swr'
import axios from 'axios'
import { group } from 'd3-array'
import { esES } from 'gridjs/l10n'
import { dictionary } from '../../utils/complaints/dictionary'
import { parseData } from '../../utils'
import 'gridjs/dist/theme/mermaid.css'
import useFilterByDate from '../../hooks/use-filtered-data'

function Summary () {
  const { data, error } = useSWR('/api/complaints', (url) => axios.get(url).then(res => res.data))

  const {
    startDate,
    endDate,
    currentDate,
    startDateChangeHandler,
    endDateChangeHandler,
    clearInputsClickHandler,
    filteredData
  } = useFilterByDate(data)

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando...</Text>

  const dataTable = Array.from(group(filteredData, d => d[dictionary.parish])).map(([parish, data]) => {
    return {
      Parroquia: parish,
      Denuncias: data.length || 0,
      Agua: data.filter(item => item[dictionary.affectedComponent].split(', ').includes('Agua')).length || 0,
      Aire: data.filter(item => item[dictionary.affectedComponent].split(', ').includes('Aire')).length || 0,
      Suelo: data.filter(item => item[dictionary.affectedComponent].split(', ').includes('Suelo')).length || 0,
      Ruido: data.filter(item => item[dictionary.affectedComponent].split(', ').includes('Ruido')).length || 0
    }
  })

  dataTable.length > 1 && dataTable.push({
    Parroquia: 'TOTAL',
    Denuncias: dataTable.map(item => item.Denuncias).reduce((prev, curr) => prev + curr, 0),
    Agua: dataTable.map(item => item.Agua).reduce((prev, curr) => prev + curr, 0),
    Aire: dataTable.map(item => item.Aire).reduce((prev, curr) => prev + curr, 0),
    Suelo: dataTable.map(item => item.Suelo).reduce((prev, curr) => prev + curr, 0),
    Ruido: dataTable.map(item => item.Ruido).reduce((prev, curr) => prev + curr, 0)
  })

  return (
    <>
      <Box mt={6}>
        <Box display="flex" rowGap={6} flexDirection={{ base: 'column', lg: 'row' }} alignItems="center" justifyContent="space-between" mb={4}>
          <Heading color="gray.700">Reporte</Heading>
          <Box display="flex" alignItems="center" flexWrap="wrap" justifyContent="space-between" rowGap={4} columnGap={{ xl: 10 }}>
            <Box display="flex" width={{ base: '45%', lg: '30%', xl: 'auto' }} alignItems="center" columnGap={1}>
              <Text flexShrink={0}>Desde: </Text>
              <Input type="date" value={startDate} max={currentDate} onChange={startDateChangeHandler} />
            </Box>
            <Box display="flex" width={{ base: '45%', lg: '30%', xl: 'auto' }} alignItems="center" columnGap={1}>
              <Text flexShrink={0}>Hasta: </Text>
              <Input type="date" value={endDate} max={currentDate} min={startDate} onChange={endDateChangeHandler} />
            </Box>
            <Button width={{ base: '100%', lg: '30%', xl: 'auto' }} colorScheme='blackAlpha' variant='outline' onClick={clearInputsClickHandler}>
              Restablecer filtros
            </Button>
          </Box>
        </Box>
        <Grid
          {...parseData(dataTable, {
            omit: []
          })}
          language={esES}
          search
          sort
          autoWidth
        />
      </Box>
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
