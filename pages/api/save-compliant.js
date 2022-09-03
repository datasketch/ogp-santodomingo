import { proxy } from '../../utils/api'

export default async function handler (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed'
    })
  }
  try {
    await proxy.save(
      process.env.AUTH_TOKEN,
      process.env.PROJECT_ID,
      'denuncias',
      req.body
    )
  } catch (error) {
    return res.status(500).json({ error })
  }
  return res.status(200).json({})
}
