import { proxy } from '../../utils/api'

export default async function handler (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed'
    })
  }
  const { id } = req.body
  const result = await proxy.update(
    process.env.BASE_URL,
    process.env.API_TOKEN,
    process.env.PROJECT_ID,
    'denuncias',
    id,
    req.body
  )
  if (!result.ok) {
    return res.status(result.status).json({ data: result.data.msg })
  }
  return res.status(result.status).json(result.data)
}
