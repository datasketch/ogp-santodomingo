export const dictionary = {
  order: 'Orden',
  status: 'Estado',
  date: 'Fecha',
  year: 'Año',
  name: 'Nombre beneficiario',
  parish: 'Parroquia',
  canton: 'Cantón',
  phoneNumber: 'Teléfono',
  address: 'Dirección / Sector',
  identifier: 'Cédula',
  subsidy: 'Subsidio o venta',
  location: 'Ubicación',
  collaborators: 'Colaboradores',
  survival: 'Supervivencia individuos',
  measurementDate: 'Fecha medición',
  actor: 'Actor',
  details: 'Detalle',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
}

export const reverseDictionary = Object.entries(dictionary).reduce((result, [key, value]) => {
  return { ...result, [value]: key }
}, {})
