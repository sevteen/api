interface BaseResponse {
  success: boolean;
  message?: string;
  code: number;
}

export interface SuccessResponse<T = undefined> extends BaseResponse {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    totalData?: number;
    totalPage?: number;
  };
}

export interface ErrorResponse extends BaseResponse {
  success: false;
  error: {
    name?: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

export class Reply {
  static success<T = undefined>(
    data: T,
    message = "Success",
    meta?: SuccessResponse["meta"],
  ): SuccessResponse<T> {
    return {
      success: true,
      message,
      code: 200,
      data,
      ...(meta && { meta }),
    };
  }

  static error(
    message: string,
    code = 500,
    details?: Record<string, unknown>,
  ): ErrorResponse {
    return {
      success: false,
      message,
      code,
      error: {
        message,
        ...(details && { details }),
      },
    };
  }

  static paginate<T = unknown>(
    data: T[],
    totalData: number,
    page: number,
    limit: number,
    message = "Success",
  ): SuccessResponse<T[]> {
    const totalPage = Math.ceil(totalData / limit);

    return {
      success: true,
      message,
      code: 200,
      data,
      meta: {
        page,
        limit,
        totalData,
        totalPage,
      },
    };
  }

  static notFound(resource = "Resource"): ErrorResponse {
    return this.error(`${resource} not found`, 404);
  }

  static badRequest(
    message: string,
    details?: Record<string, unknown>,
  ): ErrorResponse {
    return this.error(message, 400, details);
  }

  static unauthorized(message = "Unauthorized"): ErrorResponse {
    return this.error(message, 401);
  }

  static forbidden(message = "Forbidden"): ErrorResponse {
    return this.error(message, 403);
  }

  static validationError(
    details: Record<string, unknown>,
    message = "Validation Error",
  ): ErrorResponse {
    return this.error(message, 422, details);
  }
}
