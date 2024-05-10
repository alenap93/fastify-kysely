'use strict'

const fp = require('fastify-plugin')

function fastifyKysely (fastify, options, next) {
  const { namespace, kysely } = options

  const client = options.client || null

  if (!namespace) {
    return next(new Error('Namespace not defined'))
  }

  if (!kysely) {
    return next(new Error('Kysely instance not defined'))
  }

  if (!fastify.kysely) {
    fastify.decorate('kysely', Object.create(null))
  }

  if (fastify.kysely[namespace]) {
    return next(new Error(`Kysely '${namespace}' instance namespace has already been registered`))
  }

  fastify.kysely[namespace] = kysely

  const closeNamedInstance = async (fastify) => {
    return fastify.kysely[namespace].destroy()
  }

  fastify.addHook('onClose', closeNamedInstance)

  next()
}

module.exports = fp(fastifyKysely, {
  fastify: '4.x',
  name: 'fastify-kysely'
})
module.exports.default = fastifyKysely
module.exports.fastifyKysely = fastifyKysely
