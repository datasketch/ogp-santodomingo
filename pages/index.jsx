import { useEffect, useState } from 'react'
import { Box, Heading, Text } from '@chakra-ui/react'
import axios from 'axios'
import dynamic from 'next/dynamic'

const Kanban = dynamic(() => import('../components/Kanban'), {
  ssr: false
})

export default function Home () {
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [complaints, setComplaints] = useState([])

  useEffect(() => {
    let ignore = false
    axios.get('/api/read').then(response => {
      if (!ignore) {
        setIsLoading(false)
        setComplaints(response.data.data)
      }
    }).catch(error => {
      setIsLoading(false)
      setErrorMessage(error.response.data.data)
    })
    return () => {
      ignore = true
    }
  }, [])

  return (
    <>
      <Box as="div" mt={4}>
        {errorMessage && <Text align="center" color="red">{errorMessage}</Text>}
        {
          isLoading
            ? (
              <Text align="center">Cargando tablero de gestión...</Text>
              )
            : complaints.length
              ? (
                <>
                  <Heading color="gray.700" mb={4}>Tablero de denuncias</Heading>
                  <Kanban data={complaints} />
                </>
                )
              : <Text align="center">No hay denuncias a gestionar</Text>
        }
      </Box>
    </>
  )
}
