import { Api } from 'nocodb-sdk'

export const proxy = {
  instance: null,
  get (apiToken) {
    if (this.instance) {
      return this.instance
    }
    this.instance = new Api({
      baseURL: 'http://nocodb.local',
      headers: {
        'xc-token': apiToken
      }
    })
    return this.instance
  },
  async save (apiToken, projectId, table, body) {
    const api = this.get(apiToken)
    try {
      const data = await api.dbTableRow.create('v1', projectId, table, body)
      return { ok: true, status: 200, data }
    } catch (error) {
      const { status, data } = error.response
      return { ok: false, status, data }
    }
  },
  async getAll (apiToken, projectId, table) {
    const api = this.get(apiToken)
    try {
      const data = await api.dbTableRow.list('v1', projectId, table)
      return { ok: true, status: 200, data }
    } catch (error) {
      const { status, data } = error.response
      return { ok: false, status, data }
    }
  },
  async update (apiToken, projectId, table, id, body) {
    const api = this.get(apiToken)
    try {
      const data = await api.dbTableRow.update('v1', projectId, table, id, body)
      return { ok: true, status: 200, data }
    } catch (error) {
      const { status, data } = error.response
      return { ok: false, status, data }
    }
  }
}
