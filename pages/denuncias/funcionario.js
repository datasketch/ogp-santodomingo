import { Box, Checkbox, CheckboxGroup, FormControl, FormErrorMessage, FormLabel, Heading, Input, Select, Stack, Textarea } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { useState } from 'react'

const Map = dynamic(() => import('../../components/Map'), {
  ssr: false,
})

function PublicServantFormPage () {
  const center = { lat: -0.254167, lng: -79.1719 }

  const [formData, setFormData] = useState({
    'Tipo de denunciante': '',
    'Nombres y Apellidos': '',
    'C.I. / RUC': '',
    'Razón social': '',
    Email: '',
    Telefono: '',
    'Tipo de denuncia': '',
    'Estado de la denuncia': '',
    'Fecha de denuncia': '',
    'Iniciales funcionario receptor': '',
    'Fecha del incidente': '',
    'Componente afectado': [],
    Canton: '',
    Parroquia: '',
    Sector: '',
    Direccion: '',
    'Tipo de denunciado': '',
    'Nombre del denunciado': '',
    'Descripcion del acto que se denuncia': '',
    Ubicacion: `${center.lat}, ${center.lng}`
  })

  return (
    <Box
      width="100%"
      maxWidth={768}
      px={16}
      py={4}
      mx="auto"
    >
      <Heading size="lg">Formulario de denuncias - Funcionarios</Heading>
      <Stack dir="column" spacing={5} mt={5}>
        <FormControl isRequired>
          <FormLabel>Tipo de denunciante</FormLabel>
          <Select
            placeholder='Seleccione una opción'
            value={formData['Tipo de denunciante']}
            onChange={(e) => setFormData(prevState => ({ ...prevState, 'Tipo de denunciante': e.target.value }))}
          >
            {['Institución pública', 'Medio de comunicación', 'Persona Jurídica', 'Persona Natural'].map(option => (
              <option value={option} key={option}>{option}</option>
            ))}
          </Select>
        </FormControl>
        {formData['Tipo de denunciante'] === 'Persona Natural' && (
          <FormControl isRequired>
            <FormLabel>Nombres y Apellidos</FormLabel>
            <Input
              value={formData['Nombres y Apellidos']}
              onChange={(e) => setFormData(prevState => ({ ...prevState, 'Nombres y Apellidos': e.target.value }))}
            />
          </FormControl>
        )}
        <FormControl isRequired>
          <FormLabel>C.I. / RUC</FormLabel>
          <Input
            value={formData['C.I. / RUC']}
            onChange={(e) => setFormData(prevState => ({ ...prevState, 'C.I. / RUC': e.target.value }))}
          />
        </FormControl>
        {formData['Tipo de denunciante'] && formData['Tipo de denunciante'] !== 'Persona Natural' && (
          <FormControl>
            <FormLabel>Razón social</FormLabel>
            <Input
              value={formData['Razón social']}
              onChange={(e) => setFormData(prevState => ({ ...prevState, 'Razón social': e.target.value }))}
            />
          </FormControl>
        )}
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            value={formData.Email}
            onChange={(e) => setFormData(prevState => ({ ...prevState, Email: e.target.value.trim() }))}
          />
          <FormErrorMessage>Por favor introduzca un email válido</FormErrorMessage>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Teléfono</FormLabel>
          <Input
            value={formData.Telefono}
            onChange={(e) => setFormData(prevState => ({ ...prevState, Telefono: e.target.value }))}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Tipo de denuncia</FormLabel>
          <Select
            placeholder='Seleccione una opción'
            value={formData['Tipo de denuncia']}
            onChange={(e) => setFormData(prevState => ({ ...prevState, 'Tipo de denuncia': e.target.value }))}
          >
            {['Verbal', 'Escrita', 'Red social', 'Online'].map(option => (
              <option value={option} key={option}>{option}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Estado de la denuncia</FormLabel>
          <Select
            placeholder='Seleccione una opción'
            value={formData['Estado de la denuncia']}
            onChange={(e) => setFormData(prevState => ({ ...prevState, 'Estado de la denuncia': e.target.value }))}
          >
            {['Denuncia recibida', 'Denuncia atendida', 'Denuncia archivada'].map(option => (
              <option value={option} key={option}>{option}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Fecha de denuncia</FormLabel>
          <Input
            value={formData['Fecha de denuncia']}
            type="date"
            onChange={(e) => setFormData(prevState => ({ ...prevState, 'Fecha de denuncia': e.target.value }))}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Iniciales funcionario receptor</FormLabel>
          <Input
            value={formData['Iniciales funcionario receptor']}
            onChange={(e) => setFormData(prevState => ({ ...prevState, 'Iniciales funcionario receptor': e.target.value }))}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Fecha del incidente</FormLabel>
          <Input
            value={formData['Fecha del incidente']}
            type="datetime-local"
            onChange={(e) => setFormData(prevState => ({ ...prevState, 'Fecha del incidente': e.target.value }))}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Componente afectado</FormLabel>
          <CheckboxGroup
            value={formData['Componente afectado']}
            onChange={(value) => setFormData(prevState => ({ ...prevState, 'Componente afectado': value }))}
          >
            <Stack direction='row' spacing={3}>
              {['Aire', 'Agua', 'Suelo', 'Ruido'].map(option => (
                <Checkbox value={option} key={option}>{option}</Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Cantón</FormLabel>
          <Select
            placeholder='Seleccione una opción'
            value={formData.Canton}
            onChange={(e) => setFormData(prevState => ({ ...prevState, Canton: e.target.value }))}
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
            value={formData.Parroquia}
            onChange={(e) => setFormData(prevState => ({ ...prevState, Parroquia: e.target.value }))}
          >
            {['Abraham Calazacón', 'Bombolí', 'Chiguilpe', 'Río Toachi', 'Río verde', 'Santo Domingo', 'Zaracay', 'Alluriquin', 'Puerto Limón', 'Luz de América', 'San Jacinto del Bua', 'Valle Hermoso', 'El Esfuerzo', 'Santa María del Toachi', 'La Concordia', 'Monterrey', 'La Villegas', 'Plan piloto'].map(option => (
              <option value={option} key={option}>{option}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Sector</FormLabel>
          <Select
            placeholder='Seleccione una opción'
            value={formData.Sector}
            onChange={(e) => setFormData(prevState => ({ ...prevState, Sector: e.target.value }))}
          >
            {['Urbano', 'Rural'].map(option => (
              <option value={option} key={option}>{option}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Dirección</FormLabel>
          <Input
            value={formData.Direccion}
            onChange={(e) => setFormData(prevState => ({ ...prevState, Direccion: e.target.value }))}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Tipo de denunciado</FormLabel>
          <Select
            placeholder='Seleccione una opción'
            value={formData['Tipo de denunciado']}
            onChange={(e) => setFormData(prevState => ({ ...prevState, 'Tipo de denunciado': e.target.value }))}
          >
            {['Institución pública', 'Persona Jurídica', 'Persona Natural'].map(option => (
              <option value={option} key={option}>{option}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Nombre del denunciado</FormLabel>
          <Input
            value={formData['Nombre del denunciado']}
            onChange={(e) => setFormData(prevState => ({ ...prevState, 'Nombre del denunciado': e.target.value }))}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Descripción del acto que se denuncia</FormLabel>
          <Textarea
            value={formData['Descripcion del acto que se denuncia']}
            onChange={(e) => setFormData(prevState => ({ ...prevState, 'Descripcion del acto que se denuncia': e.target.value }))}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Ubicación</FormLabel>
          <Map
            center={center}
            onMarkerMove={(coords) => {
              const { lat, lng } = coords
              setFormData(prevState => ({ ...prevState, Ubicacion: `${lat}, ${lng}` }))
            }}
          />
        </FormControl>
      </Stack>
      <Box mt={5}>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </Box>
    </Box>
  )
}

export default PublicServantFormPage
