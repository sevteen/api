import fp from "fastify-plugin";

import { db, dbUtils } from "../lib";

declare module "fastify" {
  interface FastifyInstance {
    transaction: typeof dbUtils.transaction;
    query: typeof dbUtils.rawQuery;
    db: typeof db;
  }
}

export default fp(async (fastify) => {
  fastify.decorate("transaction", dbUtils.transaction);

  fastify.decorate("query", dbUtils.rawQuery);

  fastify.decorate("db", db);
});
