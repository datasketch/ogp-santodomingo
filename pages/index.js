import { Box, Flex, Link } from '@chakra-ui/react'
import NextLink from 'next/link'

export default function Home () {
  return (
    <Box as="div" maxW="container.xl" mx="auto">
      <Flex gap={2}>
        <NextLink href="/denuncias/ciudadanos" passHref>
          <Link p={[1, 2]} textDecoration="underline">Ciudadanos</Link>
        </NextLink>
        <NextLink href="/denuncias/funcionarios" passHref>
          <Link p={[1, 2]} textDecoration="underline">Funcionarios</Link>
        </NextLink>
      </Flex>
    </Box>
  )
}
