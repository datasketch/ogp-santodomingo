import { Checkbox, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, Select, Stack, Textarea } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import isEmail from 'validator/lib/isEmail'
import PropTypes from 'prop-types'
import { useComplaintForm } from '../../hooks/use-complaint-form'
import { complainantTypes, complaintTypes, affectedComponents, parishes, defendantTypes, sectors } from '../../utils/complaints'
import { dictionary } from '../../utils/complaints/dictionary'

const Map = dynamic(() => import('../../components/Map'), {
  ssr: false
})

function CitizenForm ({ id, data = {}, onSubmit }) {
  const { center, defaultValues, coordinates, setCoordinates } = useComplaintForm(data)

  const { handleSubmit, register, formState: { errors } } = useForm({
    mode: 'onBlur',
    defaultValues
  })

  const [complainantType, setcomplainantType] = useState(data.complainantType || '')

  return (
    <form id={id} onSubmit={handleSubmit((data) => onSubmit(data, coordinates))}>
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
            {...register(dictionary.complaintType, {
              value: 'Online'
            })}
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
      </Stack>
    </form>
  )
}

CitizenForm.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.object,
  onSubmit: PropTypes.func
}

export default CitizenForm
