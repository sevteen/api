import { logger } from "./lib";
import { init } from "./server";

// Start the server
(async (): Promise<void> => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const server = await init({});
    server.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    logger.error(err);
  }
})();
