/* eslint-disable react/prop-types */
import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, FormControl, FormLabel, Input, Select, Stack } from '@chakra-ui/react'
import { growingPlantsDictionary as d } from '../../utils/orders/dictionary'
import useSWR, { mutate } from 'swr'
import axios from 'axios'
import { group } from 'd3-array'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { gardenStatusEnum } from '../../utils/orders/enum'

function UpdatePlant ({ isOpen, btnRef, onClose, data = {}, setData }) {
  const { data: dataApiPlantsList, error } = useSWR('/api/plants-list', (url) => axios.get(url).then(res => res.data))
  const [showContainerInput, setShowContainerInput] = useState(false)
  const [containerData, setContainerData] = useState()
  const { handleSubmit, register, reset } = useForm({
    mode: 'onBlur',
    defaultValues: {
      [d.transplantDate]: data.transplantDate ? format(new Date(data.transplantDate), 'yyyy-MM-dd') : null,
      [d.deliveryDate]: data.deliveryDate ? format(new Date(data.deliveryDate), 'yyyy-MM-dd') : null,
      [d.plant]: data.plant,
      [d.qty]: data.qty,
      [d.container]: data.container
    }
  })
  const newFormatData = {
    [d.id]: data?.id,
    [d.plant]: data?.plant,
    [d.gardenStatus]: data?.gardenStatus,
    [d.qty]: data?.qty,
    [d.container]: data?.container,
    [d.transplantDate]: data?.transplantDate,
    [d.deliveryDate]: data?.deliveryDate,
    [d.gardenStatus]: data?.gardenStatus
  }

  if (error) return <div>Se ha presentado un error...</div>

  // VARIABLES
  const groupedByName = Array.from(group(dataApiPlantsList || [], (d) => d.Planta))
  const plantsNames = groupedByName.map(([name]) => name)
  const plantsData = groupedByName.map(item => item[1]).flat()

  const validateContainer = (event) => {
    const filtered = plantsData.filter(({ Planta }) => event.target.value === Planta)
    const hasContainer = filtered.length > 1
    setShowContainerInput(hasContainer)
    setContainerData(filtered)
    if (!hasContainer) {
      reset({ [d.container]: null })
    }
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
      id: newFormatData[d.id],
      Planta: plantObject.id,
      [d.transplantDate]: data[d.transplantDate] || null,
      [d.deliveryDate]: data[d.deliveryDate] || null
    }

    delete input.Contenedor

    const op = axios.patch('/api/plants', input)

    mutate(
      '/api/plants',
      () => toast.promise(op, {
        loading: 'Enviando...',
        success: 'Datos actualizados',
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
      setData()
    })
  }

  useEffect(() => {
    const containerData = plantsData.filter(({ Planta }) => newFormatData[d.plant] === Planta)
    if (containerData.length > 1) {
      setShowContainerInput(true)
      setContainerData(containerData)
    }
  }, [])

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={() => {
        reset()
        onClose()
        setData()
      }}
      finalFocusRef={btnRef}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Actualizar</DrawerHeader>
        <DrawerBody>
          <form action="" onSubmit={handleSubmit(onSubmit)}>
            <Stack dir="column" spacing={5}>
              <FormControl isRequired>
                <FormLabel>Estado</FormLabel>
                <Select
                  {...register(d.gardenStatus)}
                >
                  {Object.values(gardenStatusEnum).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Planta</FormLabel>
                <Select
                  mt={1}
                  {...register(d.plant, {
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
                      mt={1}
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
                  {...register(d.qty, {
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
                  {...register(d.transplantDate)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Fecha entrega</FormLabel>
                <Input
                  type="date"
                  {...register(d.deliveryDate)}
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

export default UpdatePlant
