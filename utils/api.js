import { Api } from 'nocodb-sdk'

// const PROJECT_ID = 'p_2x3nn9jmw9xkg6'

export const proxy = {
  instance: null,
  get (authToken) {
    if (this.instance) {
      return this.instance
    }
    this.instance = new Api({
      baseURL: 'http://nocodb.local',
      headers: {
        'xc-auth': authToken
      }
    })
    return this.instance
  },
  async save (authToken, projectId, table, data) {
    const api = this.get(authToken)
    const result = await api.dbTableRow.create('v1', projectId, table, data)
    return result
  }
}

// export const api = new Api({
//   baseURL: 'http://nocodb.local',
//   headers: {
//     'xc-auth': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRhdmlkQGRhdGFza2V0Y2guY28iLCJmaXJzdG5hbWUiOm51bGwsImxhc3RuYW1lIjpudWxsLCJpZCI6InVzXzcwM3BzMzNxd3VlcGloIiwicm9sZXMiOiJ1c2VyLHN1cGVyIiwidG9rZW5fdmVyc2lvbiI6ImE3YmZkYzg0MDM4ZmZlYThkYTczYzY2OWVjNjRlODk1ZGZlNmYyMDM5NzEyMzlkZTQ2ZjQ5MzYxMmY3ODM3YTY0ZGQ2NWEyNWM2ZDE4NjJiIiwiaWF0IjoxNjYyMTU0NzQ2LCJleHAiOjE2NjIxOTA3NDZ9.yMvVjcDhmtnjSg5bcMz2vs6TP7JYuLGwf9dXIaLC57w'
//   }
// })
