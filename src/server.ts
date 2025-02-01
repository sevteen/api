import type { FastifyInstance } from "fastify";
import type { FastifyUnderPressureOptions } from "@fastify/under-pressure";

import Fastify from "fastify";
import hyperid from "hyperid";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import underPressure from "@fastify/under-pressure";

import { logger } from "./lib";
import { plugins } from "./plugins";
import { setupAllShutdownHandlers } from "./shutdown";

export const underPressureConfig = (): FastifyUnderPressureOptions => ({
  async healthCheck(): Promise<boolean> {
    // TODO: Add database connection check
    return true;
  },
  message: "Under Pressure 😯",
  exposeStatusRoute: "/status",
  healthCheckInterval: 5000,
});

export const init = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    loggerInstance: logger,
    genReqId: (req) =>
      (req.headers["x-request-id"] as string) || hyperid().uuid,
  });

  plugins.forEach((plugin) => app.register(plugin));

  app.register(cors, {
    origin: true, // Reflects the request origin
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // 24 hours
  });
  app.register(helmet, {
    global: true,
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    originAgentCluster: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    strictTransportSecurity: {
      maxAge: 15552000, // 180 days
      includeSubDomains: true,
    },
    xssFilter: true,
  });
  app.register(underPressure, underPressureConfig());

  await app.ready();
  logger.info("Everything is Loaded..!");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  setupAllShutdownHandlers(app);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return app;
};
