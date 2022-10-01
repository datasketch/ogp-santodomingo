import { Box, Button, Checkbox, FormControl, FormErrorMessage, FormHelperText, FormLabel, Heading, Input, Select, Stack, Textarea } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import isEmail from 'validator/lib/isEmail'
import toast from 'react-hot-toast'
import { complainantTypes, complaintStatuses, complaintTypes, affectedComponents, dictionary, parishes, defendantTypes, sectors } from '../../utils'
import axios from 'axios'
import { useRouter } from 'next/router'

const Map = dynamic(() => import('../../components/Map'), {
  ssr: false
})

function PublicServantFormPage () {
  const router = useRouter()
  const center = { lat: -0.254167, lng: -79.1719 }

  const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm({
    mode: 'onBlur'
  })

  const [complainantType, setcomplainantType] = useState('')
  const [coordinates, setCoordinates] = useState(`${center.lat}, ${center.lng}`)

  const onSubmit = data => {
    const info = {
      ...data,
      [dictionary.location]: coordinates,
      [dictionary.affectedComponent]: data[dictionary.affectedComponent].join(', '),
      [dictionary.source]: 'Funcionario'
    }

    const op = axios.post('/api/create', info)

    toast.promise(op, {
      loading: 'Enviando...',
      success: 'Éxito',
      error: error => {
        console.log(error)
        return 'Se ha presentado un error'
      }
    }).then(() => {
      router.push('/')
    })
  }

  return (
    <Box
      width="100%"
      maxWidth={768}
      px={16}
      py={4}
      mx="auto"
    >
      <Heading size="lg">Formulario de denuncias - Funcionarios</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack dir="column" spacing={5} mt={5}>
          <FormControl isRequired>
            <FormLabel>Tipo de denunciante</FormLabel>
            <Select
              placeholder='Seleccione una opción'
              {...register(dictionary.complainantType, {
                onChange: e => setcomplainantType(e.target.value)
              })}
            >
              {complainantTypes.map(option => (
                <option value={option} key={option}>{option}</option>
              ))}
            </Select>
          </FormControl>
          {complainantType === 'Persona Natural' && (
            <FormControl isRequired>
              <FormLabel>Nombres y Apellidos</FormLabel>
              <Input {...register(dictionary.fullName)} />
            </FormControl>
          )}
          <FormControl>
            <FormLabel>C.I. / RUC</FormLabel>
            <Input {...register(dictionary.identifier)} />
          </FormControl>
          {complainantType && complainantType !== 'Persona Natural' && (
            <FormControl>
              <FormLabel>Razón social</FormLabel>
              <Input {...register(dictionary.companyName)} />
            </FormControl>
          )}
          <FormControl
            isInvalid={errors && errors[dictionary.email]}
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
            <Input {...register(dictionary.phoneNumber)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Tipo de denuncia</FormLabel>
            <Select
              placeholder='Seleccione una opción'
              {...register(dictionary.complaintType)}
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
              {...register(dictionary.complaintStatus)}
            >
              {complaintStatuses.map(option => (
                <option value={option} key={option}>{option}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Fecha de denuncia</FormLabel>
            <Input type="date" {...register(dictionary.complaintDate)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Iniciales funcionario receptor</FormLabel>
            <Input {...register(dictionary.receivingOfficer)} />
          </FormControl>
          <FormControl>
            <FormLabel>Fecha del incidente</FormLabel>
            <Input type="datetime-local" {...register(dictionary.incidentDate)} />
          </FormControl>
          <FormControl isInvalid={errors && errors[dictionary.affectedComponent]}>
            <FormLabel>Componente afectado</FormLabel>
            <Stack direction='row' spacing={3}>
              {affectedComponents.map(option => (
                <Checkbox
                  {...register(dictionary.affectedComponent, {
                    validate: v => (v && v.length) || 'Seleccione al menos un componente'
                  })}
                  value={option}
                  key={option}
                >
                  {option}
                </Checkbox>
              ))}
            </Stack>
            { errors && errors[dictionary.affectedComponent]
              ? (
                <FormErrorMessage>
                  {errors[dictionary.affectedComponent].message || errors[dictionary.affectedComponent].root.message}
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
              {...register(dictionary.parish)}
            >
              {parishes.map(option => (
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
              {sectors.map(option => (
                <option value={option} key={option}>{option}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Dirección</FormLabel>
            <Input {...register(dictionary.address)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Tipo de denunciado</FormLabel>
            <Select
              placeholder='Seleccione una opción'
              {...register(dictionary.defendantType)}
            >
              {defendantTypes.map(option => (
                <option value={option} key={option}>{option}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Nombre del denunciado</FormLabel>
            <Input {...register(dictionary.defendantName)} />
          </FormControl>
          <FormControl>
            <FormLabel>Descripción del acto que se denuncia</FormLabel>
            <Textarea {...register(dictionary.description)} />
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
