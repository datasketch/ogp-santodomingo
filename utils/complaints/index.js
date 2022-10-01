export const dictionary = {
  complainantType: 'Tipo de denunciante',
  fullName: 'Nombres y Apellidos',
  identifier: 'CI / RUC',
  companyName: 'Razon social',
  email: 'Email',
  phoneNumber: 'Telefono',
  complaintType: 'Tipo de denuncia',
  complaintStatus: 'Estado de la denuncia',
  complaintDate: 'Fecha de denuncia',
  receivingOfficer: 'Iniciales funcionario receptor',
  incidentDate: 'Fecha del incidente',
  affectedComponent: 'Componente afectado',
  canton: 'Canton',
  parish: 'Parroquia',
  sector: 'Sector',
  address: 'Direccion',
  defendantType: 'Tipo de denunciado',
  defendantName: 'Nombre del denunciado',
  description: 'Descripcion del acto que se denuncia',
  location: 'Ubicacion',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  id: 'id',
  source: 'Fuente'
}

export const reverseDictionary = Object.entries(dictionary).reduce((result, [key, value]) => {
  return { ...result, [value]: key }
}, {})

export const complainantTypes = ['Institución pública', 'Medio de comunicación', 'Persona Jurídica', 'Persona Natural']

export const complaintTypes = ['Verbal', 'Escrita', 'Red social', 'Online']

export const complaintStatuses = ['Denuncia recibida', 'Denuncia atendida', 'Denuncia archivada']

export const parishes = ['Abraham Calazacón', 'Bombolí', 'Chiguilpe', 'Río Toachi', 'Río Verde', 'Santo Domingo', 'Zaracay', 'Alluriquin', 'Puerto Limón', 'Luz de América', 'San Jacinto del Bua', 'Valle Hermoso', 'El Esfuerzo', 'Santa María del Toachi', 'La Concordia', 'Monterrey', 'La Villegas', 'Plan Piloto']

export const sectors = ['Urbano', 'Rural']

export const affectedComponents = ['Aire', 'Agua', 'Suelo', 'Ruido']

export const defendantTypes = ['Institución pública', 'Persona Jurídica', 'Persona Natural', 'Otro', 'Por determinar']

export const complaintStatusEnum = {
  RECEIVED: 'Denuncia recibida',
  ATTENDED: 'Denuncia atendida',
  ARCHIVED: 'Denuncia archivada'
}

export const sourceEnum = {
  CITIZEN: 'Ciudadano',
  OFFICER: 'Funcionario'
}
