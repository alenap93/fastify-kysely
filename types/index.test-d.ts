import Fastify, { FastifyInstance, FastifyKyselyNamespaces } from 'fastify'
import { expectAssignable, expectError, expectType } from 'tsd'
import { fastifyKysely, FastifyKyselyPluginOptions } from '..'
import { Generated, Kysely, SqliteDialect } from 'kysely'
import Database from 'better-sqlite3'

declare module 'fastify' {

  interface FastifyKyselyNamespaces {
    one: Kysely<Database>
    two: Kysely<Database>
  }

}

export interface Database {
  person: PersonTable
}

export interface PersonTable {
  id: Generated<number>

  first_name: string

  gender: 'man' | 'woman' | 'other'

  last_name: string | null
}

const app: FastifyInstance = Fastify()

const sqliteDialectOne = new SqliteDialect({
  database: new Database(':memory:')
})
const kyselyInstanceOne = new Kysely<Database>({dialect: sqliteDialectOne});

const sqliteDialectTwo = new SqliteDialect({
  database: new Database(':memory:')
})
const kyselyInstanceTwo = new Kysely<any>({dialect: sqliteDialectTwo});

app.register(fastifyKysely, { 
  namespace: 'one',
  kysely: kyselyInstanceOne
})

app.register(fastifyKysely, {
  namespace: 'two',
  kysely: kyselyInstanceTwo
})

expectAssignable<FastifyKyselyPluginOptions>({
  namespace: 'two',
  kysely: kyselyInstanceTwo
})

expectError<FastifyKyselyPluginOptions>({
  namespace: 'two',
  kysely: 5
})

const sqliteDialectThree = new SqliteDialect({
  database: new Database(':memory:')
})
const kyselyInstanceThree = new Kysely<Database>({dialect: sqliteDialectThree});

expectError(app.register(fastifyKysely, {
  kysely: kyselyInstanceThree,
  unknownOption: 'this should trigger a typescript error'
}))


// Plugin property available
app.after(() => {
  expectAssignable<FastifyKyselyNamespaces>(app.kysely)
  expectType<Kysely<Database>>(app.kysely.one)
  expectType<Kysely<Database>>(app.kysely.two)
})
