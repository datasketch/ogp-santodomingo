import { CSVLink } from 'react-csv/'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'
import { Box } from '@chakra-ui/react'

const DownloadCSV = ({ data, label }) => {
  return (
    <CSVLink data={data} filename={`${label}.csv`}>
      <Box display="flex" alignItems="center" gap={2} border='1px' borderRadius='xl' padding='2'>
        Descargar CSV
        <ArrowDownTrayIcon stroke='#000' width={20} height={20} />
      </Box>
    </CSVLink>
  )
}

DownloadCSV.propTypes = {
  data: PropTypes.array,
  label: PropTypes.string
}

export default DownloadCSV
