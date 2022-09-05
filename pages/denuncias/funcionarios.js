import { Box, Button, Checkbox, FormControl, FormErrorMessage, FormHelperText, FormLabel, Heading, Input, Select, Stack, Textarea } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import isEmail from 'validator/lib/isEmail'
import toast, { Toaster } from 'react-hot-toast'
import { complainantTypes, complaintStates, complaintTypes, componentsList, dictionary, parishList, sectorsList } from '../../utils'
import axios from 'axios'

const Map = dynamic(() => import('../../components/Map'), {
  ssr: false
})

function PublicServantFormPage () {
  const center = { lat: -0.254167, lng: -79.1719 }

  const { handleSubmit, register, reset, formState: { errors, isSubmitting } } = useForm({
    mode: 'onBlur'
  })

  const [tipoDenunciante, setTipoDenunciante] = useState('')
  const [coordinates, setCoordinates] = useState(`${center.lat}, ${center.lng}`)

  const onSubmit = data => {
    const info = {
      ...data,
      [dictionary.ubicacion]: coordinates,
      [dictionary.componenteAfectado]: data[dictionary.componenteAfectado].join(', ')
    }

    const op = axios.post('/api/save', info)

    toast.promise(op, {
      loading: 'Enviando...',
      success: 'Éxito',
      error: error => {
        console.log(error)
        return 'Se ha presentado un error'
      }
    }).then(() => reset())
  }

  return (
    <Box
      width="100%"
      maxWidth={768}
      px={16}
      py={4}
      mx="auto"
    >
      <Toaster />
      <Heading size="lg">Formulario de denuncias - Funcionarios</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack dir="column" spacing={5} mt={5}>
          <FormControl isRequired>
            <FormLabel>Tipo de denunciante</FormLabel>
            <Select
              placeholder='Seleccione una opción'
              {...register(dictionary.tipoDenunciante, {
                onChange: e => setTipoDenunciante(e.target.value)
              })}
            >
              {complainantTypes.map(option => (
                <option value={option} key={option}>{option}</option>
              ))}
            </Select>
          </FormControl>
          {tipoDenunciante === 'Persona Natural' && (
            <FormControl isRequired>
              <FormLabel>Nombres y Apellidos</FormLabel>
              <Input {...register(dictionary.nombresApellidos)} />
            </FormControl>
          )}
          <FormControl isRequired>
            <FormLabel>C.I. / RUC</FormLabel>
            <Input {...register(dictionary.identificador)} />
          </FormControl>
          {tipoDenunciante && tipoDenunciante !== 'Persona Natural' && (
            <FormControl>
              <FormLabel>Razón social</FormLabel>
              <Input {...register(dictionary.razonSocial)} />
            </FormControl>
          )}
          <FormControl
            isInvalid={errors && errors[dictionary.email]}
            isRequired
          >
            <FormLabel>Email</FormLabel>
            <Input type="email" {...register(dictionary.email, {
              validate: v => isEmail(v) || 'Por favor introduzca un email válido'
            })} />
            { errors && errors[dictionary.email] && (
                <FormErrorMessage>
                  {errors[dictionary.email].message}
                </FormErrorMessage>
            )
            }
          </FormControl>
          <FormControl>
            <FormLabel>Teléfono</FormLabel>
            <Input {...register(dictionary.telefono)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Tipo de denuncia</FormLabel>
            <Select
              placeholder='Seleccione una opción'
              {...register(dictionary.tipoDenuncia)}
            >
              {complaintTypes.map(option => (
                <option value={option} key={option}>{option}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Estado de la denuncia</FormLabel>
            <Select
              placeholder='Seleccione una opción'
              {...register(dictionary.estadoDenuncia)}
            >
              {complaintStates.map(option => (
                <option value={option} key={option}>{option}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Fecha de denuncia</FormLabel>
            <Input type="date" {...register(dictionary.fechaDenuncia)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Iniciales funcionario receptor</FormLabel>
            <Input {...register(dictionary.inicialesFuncionarioReceptor)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Fecha del incidente</FormLabel>
            <Input type="datetime-local" {...register(dictionary.fechaIncidente)} />
          </FormControl>
          <FormControl isInvalid={errors && errors[dictionary.componenteAfectado]}>
            <FormLabel>Componente afectado</FormLabel>
            <Stack direction='row' spacing={3}>
              {componentsList.map(option => (
                <Checkbox
                  {...register(dictionary.componenteAfectado, {
                    validate: v => (v && v.length) || 'Seleccione al menos un componente'
                  })}
                  value={option}
                  key={option}
                >
                  {option}
                </Checkbox>
              ))}
            </Stack>
            { errors && errors[dictionary.componenteAfectado]
              ? (
                <FormErrorMessage>
                  {errors[dictionary.componenteAfectado].message || errors[dictionary.componenteAfectado].root.message}
                </FormErrorMessage>
                )
              : <FormHelperText>Seleccione al menos un componente</FormHelperText>
            }
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Cantón</FormLabel>
            <Select
              placeholder='Seleccione una opción'
              {...register(dictionary.canton)}
            >
              {['Santo Domingo', 'La Concordia'].map(option => (
                <option value={option} key={option}>{option}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Parroquia</FormLabel>
            <Select
              placeholder='Seleccione una opción'
              {...register(dictionary.parroquia)}
            >
              {parishList.map(option => (
                <option value={option} key={option}>{option}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Sector</FormLabel>
            <Select
              placeholder='Seleccione una opción'
              {...register(dictionary.sector)}
            >
              {sectorsList.map(option => (
                <option value={option} key={option}>{option}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Dirección</FormLabel>
            <Input {...register(dictionary.direccion)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Tipo de denunciado</FormLabel>
            <Select
              placeholder='Seleccione una opción'
              {...register(dictionary.tipoDenunciado)}
            >
              {['Institución pública', 'Persona Jurídica', 'Persona Natural'].map(option => (
                <option value={option} key={option}>{option}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Nombre del denunciado</FormLabel>
            <Input {...register(dictionary.nombreDenunciado)} />
          </FormControl>
          <FormControl>
            <FormLabel>Descripción del acto que se denuncia</FormLabel>
            <Textarea {...register(dictionary.descripcionDenuncia)} />
          </FormControl>
          <FormControl>
            <FormLabel>Ubicación</FormLabel>
            <Map
              center={center}
              onMarkerMove={(coords) => {
                const { lat, lng } = coords
                setCoordinates(`${lat}, ${lng}`)
              }}
            />
          </FormControl>
          <Button
            type='submit'
            colorScheme={'teal'}
            disabled={isSubmitting}
          >
            Enviar
          </Button>
        </Stack>
      </form>
    </Box>
  )
}

export default PublicServantFormPage
