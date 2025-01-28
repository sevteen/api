import type { FastifyInstance, FastifyPluginAsync } from "fastify";

export const routes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
): Promise<void> => {
  fastify.get("/", {
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
          additionalProperties: false,
        },
      },
      tags: ["root"],
    },
    handler: async (_request, _reply) => ({ message: "Hello World!" }),
  });
};
