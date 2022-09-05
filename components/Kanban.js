import Board from '@asseinfo/react-kanban'
import PropTypes from 'prop-types'
import '@asseinfo/react-kanban/dist/styles.css'
import { dictionary } from '../utils'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useState } from 'react'

function Kanban ({ complaints }) {
  const [isUpdating, setIsUpdating] = useState(false)

  const _complaints = complaints.map((complaint) => ({
    title: complaint[dictionary.razonSocial] || complaint[dictionary.nombresApellidos],
    description: complaint[dictionary.descripcionDenuncia] || complaint[dictionary.fechaIncidente],
    ...complaint
  }))

  const handleCardDragEnd = async (board, card, source, destination) => {
    const { fromColumnId } = source
    const { toColumnId } = destination
    const body = { [dictionary.estadoDenuncia]: '' }

    if (fromColumnId === toColumnId) return

    setIsUpdating(true)

    switch (toColumnId) {
      case 'denuncias-recibidas':
        body[dictionary.estadoDenuncia] = 'Denuncia recibida'
        break
      case 'denuncias-atendidas':
        body[dictionary.estadoDenuncia] = 'Denuncia atendida'
        break
      case 'denuncias-archivadas':
        body[dictionary.estadoDenuncia] = 'Denuncia archivada'
        break
      default:
        body[dictionary.estadoDenuncia] = null
        break
    }

    const op = axios.post('/api/update', {
      id: card.id,
      ...body
    })

    toast.promise(op, {
      loading: 'Actualizando base de datos',
      success: () => {
        setIsUpdating(false)
        return 'Éxito'
      },
      error: 'Se ha presentado un error'
    })
  }

  const board = {
    columns: [
      {
        id: 'denuncias',
        title: 'Listado de denuncias',
        cards: _complaints.filter((complaint) => !complaint[dictionary.estadoDenuncia])
      },
      {
        id: 'denuncias-recibidas',
        title: 'Denuncias recibidas',
        cards: _complaints.filter((complaint) => complaint[dictionary.estadoDenuncia] === 'Denuncia recibida')
      },
      {
        id: 'denuncias-atendidas',
        title: 'Denuncias atentidas',
        cards: _complaints.filter((complaint) => complaint[dictionary.estadoDenuncia] === 'Denuncia atendida')
      },
      {
        id: 'denuncias-archivadas',
        title: 'Denuncias archivadas',
        cards: _complaints.filter((complaint) => complaint[dictionary.estadoDenuncia] === 'Denuncia archivada')
      }
    ]
  }
  return (
    <Board
      initialBoard={board}
      onCardDragEnd={handleCardDragEnd}
      allowAddCard={false}
      disableCardDrag={isUpdating}
      disableColumnDrag
    />
  )
}

Kanban.propTypes = {
  complaints: PropTypes.array
}

export default Kanban
