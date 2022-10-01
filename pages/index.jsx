import { Box, Heading, Text } from '@chakra-ui/react'
import useSWR from 'swr'
import Kanban from '../components/Kanban'

export default function Home () {
  const { data, error } = useSWR('/api/complaints', (...args) => fetch(...args).then(res => res.json()))

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando tablero de gestión...</Text>

  return (
    <>
      <Box as="div" mt={4}>
        {data.length
          ? (
            <>
              <Heading color="gray.700" mb={4}>Tablero de denuncias</Heading>
              <Kanban data={data} />
            </>
            )
          : <Text align="center">No hay denuncias a gestionar</Text>}
      </Box>
    </>
  )
}
