import { FastifyPluginCallback } from 'fastify';
import { Kysely } from 'kysely';

declare module 'fastify' {

  interface FastifyKyselyNamespaces {
    [namespace: string]: Kysely<any>;
  }

  interface FastifyInstance {
    kysely: FastifyKyselyNamespaces
  }
}

export type FastifyKyselyPluginOptions =
  {
    kysely: Kysely<any>,
    namespace?: string
  }

export const fastifyKysely: FastifyPluginCallback<NonNullable<FastifyKyselyPluginOptions>>
