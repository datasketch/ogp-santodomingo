import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, FormControl, FormLabel, Input, Select, Stack, Text } from '@chakra-ui/react'
import axios from 'axios'
import { group } from 'd3-array'
import { Router } from 'next/router'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import useSWR from 'swr'

// eslint-disable-next-line react/prop-types
function AddPlant ({ isOpen, btnRef, onClose, plantsDevData }) {
  // FETCH DATA
  const { data, error } = useSWR('/api/plants-list', (url) => axios.get(url).then(res => res.data))

  // STATES
  const [showContainerInput, setShowContainerInput] = useState(false)
  const [containerData, setContainerData] = useState([])

  // ENTERED FORM PLANTS - STATES
  const [enteredId, setEnteredId] = useState(0)
  const [enteredAmout, setEnteredAmount] = useState(0)
  const [enteredTransplantDate, setEnteredTransplantDate] = useState('')
  const [enteredDeliverDate, setEnteredDeliverDate] = useState('')

  // FUNCTIONS
  const filterByPlant = (str, data) => data.filter(item => item.Planta === str)

  const validateContainer = (event) => {
    const hasContainer = filterByPlant(event.target.value, plantData).length > 1

    // RESET
    setShowContainerInput(false)
    setContainerData([])

    // NEW CHANGE STATE
    setShowContainerInput(hasContainer)
    setContainerData(filterByPlant(event.target.value, plantData))

    // ENTERED FORM INPUTS STATES
    setEnteredId(filterByPlant(event.target.value, plantData)[0].id)
  }

  const addPlantClickHandler = (event) => {
    event.preventDefault()
    const formData = {
      // eslint-disable-next-line react/prop-types
      Orden: plantsDevData[plantsDevData.length - 1].Orden + 2,
      'Estado vivero': 'Creciendo',
      Cantidad: enteredAmout,
      'Fecha transplante': enteredTransplantDate,
      'Fecha de entrega': enteredDeliverDate,
      Plantas: enteredId
    }

    console.log(formData)

    const op = axios.post('/api/plants', formData)

    toast.promise(op, {
      loading: 'Enviando...',
      success: 'Éxito',
      error: error => {
        console.log(error)
        return 'Se ha presentado un error'
      }
    }).then(() => {
      Router.push('/')
    })
  }

  if (error) return <Text align="center" color="red">Se ha presentado un error</Text>

  if (!data) return <Text align="center">Cargando las plantas...</Text>

  // VARIABLES
  const plantNames = Array.from(group(data, (d) => d.Planta))
  const plantOptions = plantNames.map(item => item[0])
  const plantData = plantNames.map(item => item[1]).flat()

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
                    <form action="" onSubmit={addPlantClickHandler}>
                        <Stack dir="column" spacing={5}>
                            <FormControl isRequired>
                                <FormLabel>Planta</FormLabel>
                                <Select mt={1} placeholder='Select option' onChange={validateContainer}>
                                    {
                                        plantOptions.map((item, i) => {
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
                                        <Select mt={1} placeholder='Select option' onChange={(e) => setEnteredId(+e.target.value)}>
                                            {
                                                containerData.map((item, i) => {
                                                  return (
                                                        <option key={`plant-${i + 1}`} value={item.id}>{item.Contenedor}</option>
                                                  )
                                                })
                                            }
                                        </Select>
                                    </FormControl>
                                )
                            }
                            <FormControl isRequired>
                                <FormLabel>Cantidad</FormLabel>
                                <Input onChange={(e) => setEnteredAmount(+e.target.value)} type='number' min={1} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Fecha transplante</FormLabel>
                                <Input type="date" onChange={(e) => setEnteredTransplantDate(e.target.value)} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Fecha entrega</FormLabel>
                                <Input type="date" onChange={(e) => setEnteredDeliverDate(e.target.value)} />
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
