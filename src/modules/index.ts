import type { ServerResponse, IncomingMessage } from "http";
import type {
  FastifyInstance,
  RawServerDefault,
  FastifyBaseLogger,
  FastifyTypeProviderDefault,
} from "fastify";

import { readdirSync } from "fs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function modules(fastify: FastifyInstance): Promise<any> {
  const routes: (FastifyInstance<
    RawServerDefault,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    FastifyBaseLogger,
    FastifyTypeProviderDefault
  > &
    PromiseLike<undefined> & { __linterBrands: "SafePromiseLike" })[] = [];
  await Promise.all(
    readdirSync(__dirname).map(async (f) => {
      if (f !== "index.ts") {
        let module = await import(`./${f}`);

        if (module.default) {
          module = module.default;
        }

        if (!fastify.hasDecorator(module.name)) {
          routes.push(fastify.register(module));
        }
      }
    }),
  );
}

export default modules;
