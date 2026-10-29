export abstract class HttpError extends Error {
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends HttpError {
  readonly statusCode = 400;
}

export class UnauthorizedError extends HttpError {
  readonly statusCode = 401;
}

export class ForbiddenError extends HttpError {
  readonly statusCode = 403;
}

export class NotFoundError extends HttpError {
  readonly statusCode = 404;
}
