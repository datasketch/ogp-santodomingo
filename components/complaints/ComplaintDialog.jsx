import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay } from '@chakra-ui/react'
import axios from 'axios'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import { useSWRConfig } from 'swr'
import { dictionary } from '../../utils/complaints/dictionary'
import { sourceEnum } from '../../utils/complaints/enum'
import CitizenForm from './CitizenForm'
import PublicServantForm from './PublicServantForm'

function ComplaintDialog ({ isOpen, onClose, data = {} }) {
  const { mutate } = useSWRConfig()

  const handleSubmit = (data, coordinates) => {
    const info = {
      ...data,
      [dictionary.location]: coordinates,
      [dictionary.affectedComponent]: Array.isArray(data[dictionary.affectedComponent]) ? data[dictionary.affectedComponent].join(', ') : data[dictionary.affectedComponent]
    }
    const op = axios.patch('/api/complaints', info).then(res => res.data)

    mutate(
      '/api/complaints',
      () => (
        toast.promise(op, {
          loading: 'Enviando...',
          success: 'Guardado',
          error: error => {
            console.log(error)
            return 'Se ha presentado un error'
          }
        })
      ),
      {
        revalidate: true,
        rollbackOnError: true
      }
    ).then(() => onClose())
  }

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      size="xl"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Detalle denuncia</DrawerHeader>
        <DrawerBody>
          {data.source === sourceEnum.OFFICER && (
              <PublicServantForm
                id="officer"
                data={data}
                onSubmit={handleSubmit}
              />
          )}
          {data.source === sourceEnum.CITIZEN && (
            <CitizenForm
              id="officer"
              data={data}
              onSubmit={handleSubmit}
            />
          )}
        </DrawerBody>
        <DrawerFooter>
          <Button variant='outline' mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorScheme='teal'
            type='submit'
            form='officer'
          >Guardar</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

ComplaintDialog.propTypes = {
  data: PropTypes.object,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func
}

export default ComplaintDialog
