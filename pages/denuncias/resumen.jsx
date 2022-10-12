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
import { reduce, isEqual } from 'lodash'
import { useState } from 'react'
import { addDays, format, isAfter, isBefore } from 'date-fns'

function Summary () {
  const { data, error } = useSWR('/api/complaints', (url) => axios.get(url).then(res => res.data))
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const currentDate = format(new Date(), 'yyyy-MM-dd')
  const hasDateFilter = startDate || endDate

  const startDateChangeHandler = (event) => setStartDate(event.target.value)
  const endDateChangeHandler = (event) => setEndDate(event.target.value)
  const clearInputsClickHandler = () => {
    setStartDate('')
    setEndDate('')
  }

  const filterByRangeDate = (data, startDate, endDate) => {
    // eslint-disable-next-line array-callback-return
    return data.filter(item => {
      if (startDate && !endDate) {
        return (isBefore(new Date(startDate), addDays(new Date(item[dictionary.complaintDate]), -1)) || (isEqual(new Date(startDate), addDays(new Date(item[dictionary.complaintDate]), -1)))) && (isAfter(new Date(currentDate), addDays(new Date(item[dictionary.complaintDate]), -1)) || (isEqual(new Date(currentDate), addDays(new Date(item[dictionary.complaintDate]), -1))))
      }

      if (!startDate && endDate) {
        return isAfter(new Date(endDate), addDays(new Date(item[dictionary.complaintDate]), -1)) || isEqual(new Date(endDate), addDays(new Date(item[dictionary.complaintDate]), -1))
      }

      if (startDate && endDate) {
        return (isBefore(new Date(startDate), addDays(new Date(item[dictionary.complaintDate]), -1)) || (isEqual(new Date(startDate), addDays(new Date(item[dictionary.complaintDate]), -1)))) && (isAfter(new Date(endDate), addDays(new Date(item[dictionary.complaintDate]), -1)) || (isEqual(new Date(endDate), addDays(new Date(item[dictionary.complaintDate]), -1))))
      }
    })
  }

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando resumenes...</Text>

  const filteredData = !hasDateFilter
    ? data
    : filterByRangeDate(data, startDate, endDate)

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
    Denuncias: reduce(dataTable, (prev, curr) => prev.Denuncias + curr.Denuncias),
    Agua: reduce(dataTable, (prev, curr) => prev.Agua + curr.Agua),
    Aire: reduce(dataTable, (prev, curr) => prev.Aire + curr.Aire),
    Suelo: reduce(dataTable, (prev, curr) => prev.Suelo + curr.Suelo),
    Ruido: reduce(dataTable, (prev, curr) => prev.Ruido + curr.Ruido)
  })

  return (
    <>
      <Box mt={6}>
        <Box display="flex" rowGap={6} flexDirection={{ base: 'column', lg: 'row' }} alignItems="center" justifyContent="space-between" mb={4}>
          <Heading color="gray.700">Tablero de denuncias</Heading>
          <Box display="flex" alignItems="center" flexWrap="wrap" justifyContent="space-between" rowGap={4} columnGap={{ xl: 10 }}>
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
