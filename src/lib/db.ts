import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

import { logger } from "./logger";

// Define your database interface
interface Database {
  users: {
    id: number;
    email: string;
    name: string | null;
    created_at: Date;
    updated_at: Date;
  };
  // Add other tables here as needed
}

// Create database configuration
const config = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "your_database",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  max: Number(process.env.DB_POOL_SIZE) || 10,
  idleTimeoutMillis: 30000,
};

// Create a connection pool
const pool = new Pool({
  ...config,
  connectionTimeoutMillis: 5000,
});

// Log pool events
pool.on("connect", () => {
  logger.debug("Database pool connection created");
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected database pool error");
});

pool.on("acquire", () => {
  logger.debug("Database connection acquired from pool");
});

pool.on("remove", () => {
  logger.debug("Database connection removed from pool");
});

// Initialize Kysely with PostgreSQL dialect
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
  log(event): void {
    if (event.level === "query") {
      logger.debug(
        {
          query: event.query.sql,
          params: event.query.parameters,
          duration: event.queryDurationMillis,
        },
        "Database query executed",
      );
    }
  },
});

// Utility function for raw SQL execution
export const executeRawQuery = async <T = unknown>(
  query: string,
  params?: unknown[],
): Promise<T[]> => {
  try {
    const result = await pool.query(query, params);
    return result.rows as T[];
  } catch (err) {
    logger.error({ err, query, params }, "Raw query execution failed");
    throw err;
  }
};

// Database utility functions
export const dbUtils = {
  // Transaction helper
  transaction: async <T>(
    callback: (trx: Kysely<Database>) => Promise<T>,
  ): Promise<T> => {
    try {
      return await db.transaction().execute(callback);
    } catch (err) {
      logger.error({ err }, "Transaction failed");
      throw err;
    }
  },

  // Raw query with type safety
  rawQuery: executeRawQuery,

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await pool.query("SELECT 1");
      return true;
    } catch (err) {
      logger.error({ err }, "Database health check failed");
      return false;
    }
  },

  // Graceful shutdown
  async shutdown(): Promise<void> {
    try {
      await pool.end();
      await db.destroy();
      logger.info("Database pool has been closed");
    } catch (err) {
      logger.error({ err }, "Error while closing database pool");
      throw err;
    }
  },
};
