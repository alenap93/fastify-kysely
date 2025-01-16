'use strict'

const whyIsNodeRunning = require('why-is-node-running')
const { test } = require('node:test')
const Fastify = require('fastify')
const fastifyKysely = require('..')
const { Kysely, SqliteDialect } = require('kysely')
const Database = require('better-sqlite3')

test('fastify.kysely should exist', async (t) => {
  t.plan(2)
  const fastify = Fastify()

  const sqliteDialectOne = new SqliteDialect({
    database: new Database(':memory:')
  })

  const kyselyInstanceOne = new Kysely({ dialect: sqliteDialectOne })

  fastify.register(fastifyKysely, {
    namespace: 'one',
    kysely: kyselyInstanceOne
  })

  await fastify.ready()
  t.assert.ok(fastify.kysely)
  t.assert.ok(fastify.kysely.one)

  await fastify.close()
})

test('fastify.kysely should throw error if namespace will not exist', async (t) => {
  t.plan(1)
  const fastify = Fastify()

  const sqliteDialectOne = new SqliteDialect({
    database: new Database(':memory:')
  })

  const kyselyInstanceOne = new Kysely({ dialect: sqliteDialectOne })

  fastify.register(fastifyKysely, {
    kysely: kyselyInstanceOne
  })
  try {
    await fastify.ready()
  } catch (err) {
    t.assert.equal(err.message, 'Namespace not defined')
  }

  await fastify.close()
})

test('fastify.kysely should throw error if kysely instance not defined', async (t) => {
  t.plan(1)
  const fastify = Fastify()

  fastify.register(fastifyKysely, {
    namespace: 'one'
  })

  try {
    await fastify.ready()
  } catch (err) {
    t.assert.equal(err.message, 'Kysely instance not defined')
  }

  await fastify.close()
})

test('fastify.kysely should throw error if kysely instance namespace has already been registered', async (t) => {
  t.plan(1)
  const fastify = Fastify()

  const sqliteDialectOne = new SqliteDialect({
    database: new Database(':memory:')
  })

  const kyselyInstanceOne = new Kysely({ dialect: sqliteDialectOne })

  const sqliteDialectTwo = new SqliteDialect({
    database: new Database(':memory:')
  })

  const kyselyInstanceTwo = new Kysely({ dialect: sqliteDialectTwo })

  fastify.register(fastifyKysely, {
    kysely: kyselyInstanceOne,
    namespace: 'one'
  })

  fastify.register(fastifyKysely, {
    kysely: kyselyInstanceTwo,
    namespace: 'one'
  })

  try {
    await fastify.ready()
  } catch (err) {
    t.assert.equal(err.message, 'Kysely \'one\' instance namespace has already been registered')
  }

  await fastify.close()
})

test('person table will be created', async (t) => {
  t.plan(2)
  const fastify = Fastify()

  const sqliteDialectOne = new SqliteDialect({
    database: new Database(':memory:')
  })

  const kyselyInstanceOne = new Kysely({ dialect: sqliteDialectOne })

  fastify.register(fastifyKysely, {
    namespace: 'one',
    kysely: kyselyInstanceOne
  })

  await fastify.ready()

  await fastify.kysely.one.schema.createTable('person')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('first_name', 'varchar(255)')
    .addColumn('last_name', 'varchar(255)')
    .addColumn('gender', 'varchar(255)')
    .execute()

  const resultInsert = await fastify.kysely.one.insertInto('person')
    .values({
      first_name: 'Max',
      last_name: 'Jack',
      gender: 'M'
    })
    .execute()

  t.assert.equal(resultInsert[0].numInsertedOrUpdatedRows, 1n)

  const resultSelect = await fastify.kysely.one.selectFrom('person')
    .selectAll()
    .execute()

  t.assert.equal(resultSelect[0].gender, 'M')

  await fastify.close()
})

setInterval(() => {
  whyIsNodeRunning()
}, 5000).unref()
