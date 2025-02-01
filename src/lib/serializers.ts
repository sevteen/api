import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export interface SerializedError {
  type: string;
  message: string;
  stack?: string;
  code?: string;
  statusCode?: number;
  validation?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SerializedResponse {
  statusCode: number;
  duration: number;
  headers?: Record<string, string>;
  size?: number;
  type?: string;
  body?: unknown;
  error?: SerializedError;
  success: boolean;
  url?: string;
  method?: string;
}

export interface SerializedRequest {
  method: string;
  url: string;
  path: string;
  parameters: Record<string, unknown>;
  headers: Record<string, string>;
  remoteAddress?: string;
  remotePort?: number;
}

export const serializers = {
  err: (error: Error | FastifyError): SerializedError => {
    if (!error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return error as any;
    }

    const serialized: SerializedError = {
      type: error.constructor.name,
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    };

    if ("code" in error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      serialized.code = (error as any).code;
    }

    if ("statusCode" in error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      serialized.statusCode = (error as any).statusCode;
    }

    if ("validation" in error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      serialized.validation = (error as any).validation;
    }

    // Add any additional custom properties
    Object.getOwnPropertyNames(error).forEach((prop) => {
      if (
        ![
          "type",
          "message",
          "stack",
          "code",
          "statusCode",
          "validation",
        ].includes(prop)
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serialized[prop] = (error as any)[prop];
      }
    });

    return serialized;
  },

  res: (reply: FastifyReply): SerializedResponse => {
    const response: SerializedResponse = {
      statusCode: reply.statusCode,
      duration: reply.elapsedTime,
      success: reply.statusCode >= 200 && reply.statusCode < 400,
      url: reply.request.url,
      method: reply.request.method,
    };

    // Only include headers in development
    if (process.env.NODE_ENV === "development") {
      response.headers = reply.getHeaders() as Record<string, string>;

      // Try to get response body if available
      try {
        const payload = reply.request.body;
        if (payload) {
          response.body = JSON.parse(payload.toString());
        }
      } catch {
        // If we can't parse the body, ignore it
      }

      // Get content type and size if available
      const contentType = reply.getHeader("content-type");
      if (contentType) {
        response.type = contentType.toString();
      }

      const contentLength = reply.getHeader("content-length");
      if (contentLength) {
        response.size = parseInt(contentLength.toString(), 10);
      }
    }

    // If there's an error, serialize it
    if (reply.statusCode >= 400) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      response.error = serializers.err(reply.error);
    }

    return response;
  },

  req: (request: FastifyRequest): SerializedRequest => {
    const parameters = {
      ...request.params!,
      ...request.query!,
      // Omit sensitive data from body
      ...(request.body && typeof request.body === "object"
        ? Object.fromEntries(
            Object.entries(request.body as object).map(([key, value]) => [
              key,
              key.toLowerCase().includes("password") ? "[REDACTED]" : value,
            ]),
          )
        : {}),
    };

    return {
      method: request.method,
      url: request.url,
      path: request.routeOptions.url || request.url,
      parameters,
      headers: sanitizeHeaders(request.headers),
      remoteAddress: request.ip,
      remotePort: request.socket.remotePort,
    };
  },
};

// Helper function to sanitize headers
function sanitizeHeaders(
  headers: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const sanitized: Record<string, string> = {};
  const sensitiveHeaders = ["authorization", "cookie", "set-cookie"];

  Object.entries(headers).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase();
    if (sensitiveHeaders.includes(lowerKey)) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = Array.isArray(value) ? value.join(", ") : value || "";
    }
  });

  return sanitized;
}
