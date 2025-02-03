import type { FastifyInstance } from "fastify";

import { dbUtils } from "../../lib";

async function routes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/ping", async (_request, _reply) => {
    const ping = await dbUtils.healthCheck();
    if (ping) {
      return "pong!";
    }
    return ":(";
  });
}

export default routes;
