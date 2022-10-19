import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, FormControl, FormLabel, Input, Select, Stack, Text } from '@chakra-ui/react'
import axios from 'axios'
import { group } from 'd3-array'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import useSWR, { mutate } from 'swr'
import { useForm } from 'react-hook-form'
import { growingPlantsDictionary as d } from '../../utils/orders/dictionary'

// eslint-disable-next-line react/prop-types
function AddPlant ({ isOpen, btnRef, onClose }) {
  const { data, error } = useSWR('/api/plants-list', (url) => axios.get(url).then(res => res.data))
  const { handleSubmit, register, reset } = useForm({
    mode: 'onBlur'
  })
  const [showContainerInput, setShowContainerInput] = useState(false)
  const [containerData, setContainerData] = useState([])

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando las plantas...</Text>

  // VARIABLES
  const groupedByName = Array.from(group(data, (d) => d.Planta))
  const plantsNames = groupedByName.map(([name]) => name)
  const plantsData = groupedByName.map(item => item[1]).flat()

  const validateContainer = (event) => {
    const filtered = plantsData.filter(({ Planta }) => event.target.value === Planta)
    const hasContainer = filtered.length > 1
    setShowContainerInput(hasContainer)
    setContainerData(filtered)
  }

  const onSubmit = (data) => {
    const plantObject = plantsData.find(item => {
      if (!data.Contenedor) return item.Planta === data.Planta
      return item.Planta === data.Planta && item.Contenedor === data.Contenedor
    })
    if (!plantObject) {
      alert('Algo salió muy mal. Contacte a soporte')
      return
    }
    const input = {
      ...data,
      'Estado vivero': 'Creciendo',
      Planta: plantObject.id,
      [d.transplantDate]: data[d.transplantDate] || null,
      [d.deliveryDate]: data[d.deliveryDate] || null
    }

    delete input.Contenedor

    const op = axios.post('/api/plants', input)

    mutate(
      '/api/plants',
      () => toast.promise(op, {
        loading: 'Enviando...',
        success: 'Éxito',
        error: error => {
          console.log(error)
          return 'Se ha presentado un error'
        }
      }),
      {
        revalidate: true
      }
    ).then(() => {
      onClose()
      reset()
    })
  }

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
          <form action="" onSubmit={handleSubmit(onSubmit)}>
            <Stack dir="column" spacing={5}>
              <FormControl isRequired>
                <FormLabel>Planta</FormLabel>
                <Select
                  mt={1}
                  placeholder='Select option'
                  {...register('Planta', {
                    onChange: validateContainer
                  })}
                >
                  {
                    plantsNames.map((item, i) => {
                      return (
                        <option key={`plant-${i + 1}`} value={item}>{item}</option>
                      )
                    })
                  }
                </Select>
              </FormControl>
              {
                showContainerInput && (
                  <FormControl isRequired>
                    <FormLabel>Contenedor</FormLabel>
                    <Select
                      mt={1} placeholder='Select option'
                      {...register('Contenedor')}
                    >
                      {
                        containerData.map((item, i) => {
                          return (
                            <option key={`plant-${i + 1}`} value={item.Contenedor}>{item.Contenedor}</option>
                          )
                        })
                      }
                    </Select>
                  </FormControl>
                )
              }
              <FormControl isRequired>
                <FormLabel>Cantidad</FormLabel>
                <Input
                  type='number'
                  {...register('Cantidad', {
                    required: true,
                    min: 1,
                    valueAsNumber: true
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Fecha transplante</FormLabel>
                <Input
                  type="date"
                  {...register('Fecha transplante') }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Fecha entrega</FormLabel>
                <Input
                  type="date"
                  {...register('Fecha de entrega')}
                />
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
