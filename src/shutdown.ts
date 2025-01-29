import type { FastifyInstance } from "fastify";

import { logger, dbUtils } from "./lib";

function setTrapForUncaughtExceptions(): void {
  process.on("uncaughtException", (err) => {
    console.error(
      "[UNCAUGHT_EXCEPTION]",
      `${new Date().toUTCString()}: Process will now exit. UncaughtException:`,
      err.message,
      err.stack,
    );

    process.exit(1);
  });
}

export function setupAllShutdownHandlers(fastify: FastifyInstance): void {
  async function closeDbConnection(): Promise<void> {
    logger.info({ message: "Closing DB connection..." });
    try {
      await dbUtils.shutdown();
      logger.info({ message: "DB connection successfully closed!" });
    } catch (err) {
      logger.error({ message: "SERVER_SHUTDOWN closeDbConnection", err });
    }
  }

  const closeServer = async (): Promise<void> => {
    console.log("Shutting down server...");
    await fastify.close();
    console.log("Server shut down gracefully.");
  };

  async function setupShutdownHandlersFor(signal: string): Promise<void> {
    process.on(signal, async function onSigterm() {
      try {
        logger.info({
          message: `Got ${signal}. Graceful shutdown start ${new Date().toISOString()}`,
        });
        await closeDbConnection();
        await closeServer();
      } catch (err) {
        logger.error({
          message:
            "SERVER_SHUTDOWN signalHandler Could not shutdown everything cleanly!",
          err,
        });
      } finally {
        process.exit();
      }
    });
  }

  process.on("SIGINT", closeServer);
  process.on("SIGTERM", closeServer);
  setupShutdownHandlersFor("SIGINT");
  setupShutdownHandlersFor("SIGTERM");
  setTrapForUncaughtExceptions();
}
