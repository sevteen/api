import pino from "pino";

import { serializers } from "./serializers";

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
      messageFormat:
        "{msg} {req?.method} {req?.url} {res?.statusCode} {err?.message}",
    },
  },
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  serializers: {
    ...serializers,
    // You can add additional custom serializers here
  },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.token",
    ],
    remove: true,
  },
});
