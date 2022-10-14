import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, FormControl, FormLabel, Input, Select, Stack, Text } from '@chakra-ui/react'
import axios from 'axios'
import useSWR from 'swr'

// eslint-disable-next-line react/prop-types
function AddPlant ({ isOpen, btnRef, onClose }) {
  const { data, error } = useSWR('/api/plants-list', (url) => axios.get(url).then(res => res.data))

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando las plantas...</Text>

  console.log(data)

  const plants = [...new Set(data.map(item => item.Planta))]

  return (
        <Drawer
            isOpen={isOpen}
            placement='right'
            onClose={onClose}
            finalFocusRef={btnRef}
        >
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Agregar</DrawerHeader>
                <DrawerBody>
                    <form action="">
                        <Stack dir="column" spacing={5}>
                            <FormControl isRequired>
                                <FormLabel>Planta</FormLabel>
                                <Select mt={1} placeholder='Select option'>
                                    {
                                        plants.map((item, i) => {
                                          return (
                                                <option key={`plant-${i + 1}`} value={item}>{item}</option>
                                          )
                                        })
                                    }
                                </Select>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Cantidad</FormLabel>
                                <Input type='number' min={1} />
                            </FormControl>
                            <Button
                                type='submit'
                                colorScheme={'teal'}
                            >
                                Enviar
                            </Button>
                        </Stack>
                    </form>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
  )
}

export default AddPlant
