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
