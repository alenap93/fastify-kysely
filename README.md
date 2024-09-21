# fastify-kysely

[![CI](https://github.com/alenap93/fastify-kysely/actions/workflows/ci.yml/badge.svg)](https://github.com/alenap93/fastify-kysely/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/fastify-kysely.svg?style=flat)](https://www.npmjs.com/package/fastify-kysely)
[![NPM downloads](https://img.shields.io/npm/dm/fastify-kysely.svg?style=flat)](https://www.npmjs.com/package/fastify-kysely)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

Fastify Kysely connection plugin; with this you can share the same Kysely instances in every part of your server.

## Install

```
npm i kysely fastify-kysely
```

## Usage

Add it to your project with `register` and you are done!

## Typescript

By default `fastify-kysely` is using generic empty `FastifyKyselyNamespaces` interfaces, it is possible to set your namespaces with their DBs:

```typescript
declare module 'fastify' {

    interface FastifyKyselyNamespaces {
        sqliteDB: Kysely<SQLiteDatabase>,
        postgresDB: Kysely<PostgresDatabase>
    }

}
```

### Create a new Kysely instance

Under the hood [kysely](https://github.com/kysely-org/kysely) is used as SQL query builder, the ``options`` that you pass to `register` will be the namespace and Kysely instance.

```ts
import fastify from 'fastify'
import Database from 'better-sqlite3'
import { fastifyKysely } from 'fastify-kysely'
import { Generated, Kysely, SqliteDialect } from 'kysely'

interface Database {
    person: PersonTable
}

interface PersonTable {
    id: Generated<number>

    first_name: string

    last_name: string
}

declare module 'fastify' {

    interface FastifyKyselyNamespaces {
        sqliteDB: Kysely<Database>
    }

}


const listen = async (): Promise<void> => {

    const sqliteDialect = new SqliteDialect({
        database: new Database(':memory:')
      })
    
    const kyselyInstance = new Kysely<Database>({dialect: sqliteDialect});

    const server = fastify()

    await server.register(fastifyKysely, {
        namespace: 'sqliteDB',
        kysely: kyselyInstance
    })

    await server.kysely.sqliteDB.schema.createTable('person')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('first_name', 'varchar')
    .addColumn('last_name', 'varchar')
    .execute();
  
    await server.kysely.sqliteDB.insertInto('person')
    .values([
        {
            first_name: 'Max',
            last_name: 'Jack',
        },
        {
            first_name: 'Greg',
            last_name: 'Johnson',
        },
    ])
    .execute();

    server.get('/', async (request, reply) => {
        const result = await request.server.kysely.sqliteDB.selectFrom('person').selectAll().execute()
        return result
    })
    
    server.listen({ port: 5000 }, (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Server listening at ${address}`)
    })
}

listen().then()
```

### Accessing the Kysely instance

Once you have registered your plugin, you can access to Kysely instance via `fastify.namespace` where `namespace` is specified in options. 

The Kysely instance is automatically destroyed (and connections to db closed) when the fastify instance is closed.

```ts
server.register(fastifyKysely, { namespace: 'sqliteDB', kysely: kyselyInstance })
```

## Registering multiple Kysely instances

By using the `namespace` option you can register multiple Kysely instances.

## Compatibility to Fastify Versions

<table>
  <thead>
    <tr>
      <th>Fastify</th>
      <th>fastify-kysely</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        v4
      </td>
      <td>
        1.x.x
      </td>
    </tr>
    <tr>
      <td>
        v5
      </td>
      <td>
        2.x.x
      </td>
    </tr>
  </tbody>
</table>

## Example

Example is available [here](https://github.com/alenap93/fastify-kysely-example).

## License

Licensed under [MIT](./LICENSE).
