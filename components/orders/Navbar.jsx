import { Flex, Link } from '@chakra-ui/react'
import NextLink from 'next/link'

function Navbar () {
  return (
    <Flex gap={4} justify="flex-end" pt={2}>
      <NextLink href="/plantas" passHref>
        <Link p={[1, 2]}>Pedidos</Link>
      </NextLink>
      <NextLink href="/plantas/desarrollo" passHref>
        <Link p={[1, 2]}>Plantas en desarrollo</Link>
      </NextLink>
      <NextLink href="/plantas/inventario" passHref>
        <Link p={[1, 2]}>Inventario</Link>
      </NextLink>
      <NextLink href="/plantas/reporte" passHref>
        <Link p={[1, 2]}>Reporte(Plantas entregadas)</Link>
      </NextLink>
    </Flex>
  )
}

export default Navbar
