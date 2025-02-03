import fp from "fastify-plugin";

import { db, dbUtils } from "../lib";

declare module "fastify" {
  interface FastifyRequest {
    transaction: typeof dbUtils.transaction;
    rawQuery: typeof dbUtils.rawQuery;
    db: typeof db;
  }
}

export default fp(async (fastify) => {
  fastify.decorateRequest("transaction", dbUtils.transaction);

  fastify.decorateRequest("rawQuery", dbUtils.rawQuery);

  fastify.decorateRequest("db", db);
});
