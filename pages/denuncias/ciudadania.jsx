import { Box, Button, Checkbox, FormControl, FormErrorMessage, FormHelperText, FormLabel, Heading, Input, Select, Stack, Textarea } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
// import { useRouter } from 'next/router'
import { useState } from 'react'
import axios from 'axios'
import dynamic from 'next/dynamic'
import isEmail from 'validator/lib/isEmail'
import toast, { Toaster } from 'react-hot-toast'
import { complainantTypes, affectedComponents, parishes, defendantTypes, sectors } from '../../utils/complaints'
import { complaintStatusEnum } from '../../utils/complaints/enum'
import { dictionary } from '../../utils/complaints/dictionary'

const Map = dynamic(() => import('../../components/Map'), {
  ssr: false
})

function CitizenFormPage () {
  // const router = useRouter()
  const center = { lat: -0.254167, lng: -79.1719 }

  const { handleSubmit, register, formState: { errors, isSubmitted }, reset } = useForm({
    mode: 'onBlur'
  })

  const [complainantType, setcomplainantType] = useState('')
  const [canton, setCanton] = useState('')
  const [coordinates, setCoordinates] = useState(`${center.lat}, ${center.lng}`)

  const onSubmit = async data => {
    const info = {
      ...data,
      [dictionary.location]: coordinates,
      [dictionary.affectedComponent]: data[dictionary.affectedComponent].join(', '),
      [dictionary.source]: 'Ciudadano',
      [dictionary.complaintStatus]: complaintStatusEnum.RECEIVED,
      [dictionary.complaintType]: 'Online'
    }

    try {
      await axios.post('/api/complaints', info)
      window.scroll(0, 0)
      toast.success('Denuncia guardada', {
        duration: 5000
      })
      reset()
    } catch (error) {
      toast.error('Se ha presentado un error')
    }
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
            <FormLabel>Actividad denunciada</FormLabel>
            <Input {...register(dictionary.reportedActivity)} />
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
          <Box>
            <p><b>Aviso de responsabilidad:</b> Recuerde que toda información falsa será sancionada y puede incurrir en procesos legales.</p>
          </Box>
          <FormControl isRequired display={'inline-flex'} alignItems='center' >
            <Checkbox
              alignSelf={'start'}
              marginTop='1.5'
              marginRight='1.5'
              colorScheme={'teal'}
            />
            <FormLabel>
              Declaro que toda la información proporcionada es verdadera, correcta, y puede ser verificada
            </FormLabel>
          </FormControl>
          <Button
            type='submit'
            colorScheme={'teal'}
            isLoading={isSubmitted}
          >
            Enviar
          </Button>
        </Stack>
      </form>
    </Box>
  )
}

export default CitizenFormPage
