import { CSVLink } from 'react-csv/'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'
import { Box, Text } from '@chakra-ui/react'

const DownloadCSV = ({ data, label }) => {
  return (
    <CSVLink data={data} filename={`${label}.csv`}>
      <Box display="flex" alignItems="center" gap={1} border='1px' borderRadius='md' px={4} height={10} fontWeight={'semibold'} color={'blackAlpha.600'}>
        <Text>Descargar CSV</Text>
        <ArrowDownTrayIcon stroke='#000' width={16} height={16} />
      </Box>
    </CSVLink>
  )
}

DownloadCSV.propTypes = {
  data: PropTypes.array,
  label: PropTypes.string
}

export default DownloadCSV
