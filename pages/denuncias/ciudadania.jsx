import { Box, Button, Checkbox, FormControl, FormErrorMessage, FormHelperText, FormLabel, Heading, Input, Select, Stack, Textarea } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import dynamic from 'next/dynamic'
import isEmail from 'validator/lib/isEmail'
import toast, { Toaster } from 'react-hot-toast'
import { complainantTypes, complaintTypes, affectedComponents, parishes, defendantTypes, sectors } from '../../utils/complaints'
import { complaintStatusEnum } from '../../utils/complaints/enum'
import { dictionary } from '../../utils/complaints/dictionary'

const Map = dynamic(() => import('../../components/Map'), {
  ssr: false
})

function CitizenFormPage () {
  const router = useRouter()
  const center = { lat: -0.254167, lng: -79.1719 }

  const { handleSubmit, register, reset, formState: { errors, isSubmitting } } = useForm({
    mode: 'onBlur'
  })

  const [complainantType, setcomplainantType] = useState('')
  const [canton, setCanton] = useState('')
  const [coordinates, setCoordinates] = useState(`${center.lat}, ${center.lng}`)

  const onSubmit = data => {
    const info = {
      ...data,
      [dictionary.location]: coordinates,
      [dictionary.affectedComponent]: data[dictionary.affectedComponent].join(', '),
      [dictionary.source]: 'Ciudadano',
      [dictionary.complaintStatus]: complaintStatusEnum.RECEIVED
    }

    const op = axios.post('/api/complaints', info)

    toast.promise(op, {
      loading: 'Enviando...',
      success: 'Éxito',
      error: error => {
        console.log(error)
        return 'Se ha presentado un error'
      }
    }).then(() => {
      router.push('/denuncias/ciudadania')
      reset()
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

      <Toaster />
      <Box >
        <Button
          type='button'
          colorScheme={'gray'}
          alignItems={'center'}
          display='flex'
          gap={2}
          mb={2}
          onClick={() => router.push('/denuncias')}
        >
          <ArrowLeftIcon fill='#000' width={18} height={18}/>
          Volver
        </Button>
      </Box>
      <Heading size="lg">Formulario de denuncias</Heading>
      <form action="" onSubmit={handleSubmit(onSubmit)}>
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
            <FormControl>
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
            isRequired
          >
            <FormLabel>Email</FormLabel>
            <Input type="email" {...register(dictionary.email, {
              validate: v => isEmail(v) || 'Por favor introduzca un email válido'
            })} />
            {errors && errors[dictionary.email] && (
              <FormErrorMessage>
                {errors[dictionary.email].message}
              </FormErrorMessage>
            )
            }
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Teléfono</FormLabel>
            <Input {...register(dictionary.phoneNumber)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Fecha del incidente</FormLabel>
            <Input type="datetime-local" {...register(dictionary.incidentDate)} />
          </FormControl>
          <FormControl isRequired isDisabled>
            <FormLabel>Tipo de denuncia</FormLabel>
            <Select
              placeholder='Seleccione una opción'
              defaultValue="Online"
              {...register(dictionary.complaintType)}
            >
              {complaintTypes.map(option => (
                <option value={option} key={option}>{option}</option>
              ))}
            </Select>
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
            {errors && errors[dictionary.affectedComponent]
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
              onChange={(e) => setCanton(e.target.value)}
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
              {parishes[canton]?.map(option => (
                <option value={option} key={option}>{option}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
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

export default CitizenFormPage
