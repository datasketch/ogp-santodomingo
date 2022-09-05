import { useEffect, useState } from 'react'
import { Box, Flex, Link, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import axios from 'axios'
import dynamic from 'next/dynamic'
import { Toaster } from 'react-hot-toast'

const Kanban = dynamic(() => import('../components/Kanban'), {
  ssr: false
})

export default function Home () {
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [complaints, setComplaints] = useState([])

  useEffect(() => {
    let ignore = false
    axios.get('/api/get').then(response => {
      if (!ignore) {
        setIsLoading(false)
        setComplaints(response.data.list)
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
      <Toaster />
      <Box as="div" maxW="container.xl" mx="auto">
        <Flex gap={2}>
          <NextLink href="/denuncias/ciudadanos" passHref>
            <Link p={[1, 2]} textDecoration="underline">Ciudadanos</Link>
          </NextLink>
          <NextLink href="/denuncias/funcionarios" passHref>
            <Link p={[1, 2]} textDecoration="underline">Funcionarios</Link>
          </NextLink>
        </Flex>
        <Box as="div" mt={4}>
          {errorMessage && <Text align="center" color="red">{errorMessage}</Text>}
          {isLoading && <Text align="center">Cargando tablero de gestión...</Text>}
          {complaints.length
            ? (<Kanban complaints={complaints} />)
            : null}
        </Box>
      </Box>
    </>
  )
}
