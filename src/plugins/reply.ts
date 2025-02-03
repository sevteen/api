import type { FastifyReply } from "fastify";

import dayjs from "dayjs";
import fp from "fastify-plugin";

import { Reply } from "../lib";

declare module "fastify" {
  interface FastifyReply {
    success<T>(data: T, message?: string): FastifyReply;
    error(message: string, code?: number): FastifyReply;
    notFound(resource?: string): FastifyReply;
    badRequest(message: string): FastifyReply;
    unauthorized(message?: string): FastifyReply;
    forbidden(message?: string): FastifyReply;
    validationError(details: Record<string, unknown>): FastifyReply;
    paginate<T>(
      data: T[],
      totalData: number,
      page: number,
      limit: number,
      message?: string,
    ): FastifyReply;
  }
}

export default fp(
  async (fastify) => {
    fastify.log.info("Reply plugin starting");

    // Modify global response if status code >= 200

    fastify.addHook("onRoute", (routeOptions) => {
      routeOptions.config = {
        ...routeOptions.config,
        globalSerialize:
          (routeOptions.config as any)?.globalSerialize === false
            ? false
            : true,
      };
    });

    fastify.addHook("onSend", (request, reply, payload, done) => {
      if (
        reply.statusCode >= 200 &&
        (request.routeOptions.config as any).globalSerialize
      ) {
        const timestamp = dayjs().format();
        let existingPayload;
        try {
          existingPayload = payload ? JSON.parse(payload as string) : {};
        } catch (e) {
          done(null, payload);
          return;
        }

        const existingMeta = existingPayload.meta || {};

        const globalMeta = {
          timestamp,
          request_id: request.id,
          response_time: `${reply.elapsedTime}ms`,
          ...existingMeta,
        };

        const modifiedPayload = {
          ...existingPayload,
          status_code: existingPayload.statusCode,
          meta: globalMeta,
        };

        delete modifiedPayload.statusCode;

        done(null, JSON.stringify(modifiedPayload));
      } else {
        done(null, payload);
      }
    });

    // Success response
    fastify.decorateReply(
      "success",
      function success(data: unknown, message?: string) {
        const response = Reply.success(data, message);
        return this.code(200).send(response);
      },
    );

    // Error response
    fastify.decorateReply("error", function error(message: string, code = 500) {
      const response = Reply.error(message, code);
      return this.code(code).send(response);
    });

    // Not found response
    fastify.decorateReply("notFound", function notFound(resource?: string) {
      const response = Reply.notFound(resource);
      return this.code(404).send(response);
    });

    // Bad request response
    fastify.decorateReply("badRequest", function badRequest(message: string) {
      const response = Reply.badRequest(message);
      return this.code(400).send(response);
    });

    // Unauthorized response
    fastify.decorateReply(
      "unauthorized",
      function unauthorized(message?: string) {
        const response = Reply.unauthorized(message);
        return this.code(401).send(response);
      },
    );

    // Forbidden response
    fastify.decorateReply("forbidden", function forbidden(message?: string) {
      const response = Reply.forbidden(message);
      return this.code(403).send(response);
    });

    // Validation error response
    fastify.decorateReply(
      "validationError",
      function validationError(details: Record<string, unknown>) {
        const response = Reply.validationError(details);
        return this.code(422).send(response);
      },
    );

    // Paginated response
    fastify.decorateReply("paginate", function paginate<
      T,
    >(this: FastifyReply, data: T[], totalData: number, page: number, limit: number, message?: string) {
      const response = Reply.paginate(data, totalData, page, limit, message);
      return this.code(200).send(response);
    });
  },
  {
    name: "reply",
    dependencies: [],
  },
);
