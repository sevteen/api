import Fastify from "fastify";
import hyperid from "hyperid";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { logger } from "./lib";
import { routes } from "./routes";

const server = Fastify({
  logger,
  disableRequestLogging: false,
  connectionTimeout: 60000,
  genReqId: () => hyperid().uuid,
});

// Register plugins with latest v5 options
await server.register(cors, {
  origin: true, // Reflects the request origin
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 hours
});

await server.register(helmet, {
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

// Register Swagger with latest v5 options
await server.register(swagger, {
  openapi: {
    info: {
      title: "The API",
      description: "API Documentation",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    tags: [{ name: "root", description: "Root endpoints" }],
  },
  hideUntagged: false,
});

// Register Swagger UI
await server.register(swaggerUi, {
  routePrefix: "/documentation",
  uiConfig: {
    docExpansion: "list",
    deepLinking: true,
    displayRequestDuration: true,
  },
  staticCSP: true,
});

// Register routes
await server.register(routes);

// Start the server
const start = async (): Promise<void> => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await server.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await server.close();
  process.exit(0);
});

start();
