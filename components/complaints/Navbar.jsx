import { Flex, Link } from '@chakra-ui/react'
import NextLink from 'next/link'

function Navbar () {
  const hover = {
    textDecoration: 'none',
    fontWeight: '600'
  }
  return (
    <Flex gap={4} justify="flex-end">
      <NextLink href="/denuncias" passHref>
        <Link p={[1, 2]} _hover={hover} borderBottom="4px" borderColor="transparent">Tablero</Link>
      </NextLink>
      <NextLink href="/denuncias/resumen" passHref>
        <Link p={[1, 2]} _hover={hover} borderBottom="4px" borderColor="transparent">Reportes</Link>
      </NextLink>
      <NextLink href="/denuncias/ciudadania" passHref>
        <Link p={[1, 2]} _hover={hover} borderBottom="4px" borderColor="orange">Ciudadanía</Link>
      </NextLink>
      <NextLink href="/denuncias/funcionarios" passHref>
        <Link p={[1, 2]} _hover={hover} borderBottom="4px" borderColor="pink">Funcionarios</Link>
      </NextLink>
    </Flex>
  )
}

export default Navbar
