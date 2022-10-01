import { loadEnvConfig } from '@next/env'

const projectDir = process.cwd()
const { POSTGRES_PASSWORD, POSTGRES_USER, POSTGRES_DB, POSTGRES_HOST } = loadEnvConfig(projectDir).combinedEnv

const config = {
  client: 'pg',
  connection: {
    host: POSTGRES_HOST,
    port: 5432,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB
  }
}

export default config
