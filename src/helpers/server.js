export class ServerError {
  constructor(message = 'Server error', status = 500) {
    this.message = message;
    this.status = status;
  }
}

export const ForbiddenError = msg =>
  new ServerError(msg ? msg : 'Forbidden', 403);

export const BadRequestError = msg =>
  new ServerError(msg ? msg : 'Bad request', 400);

export const NotFoundError = msg =>
  new ServerError(msg ? msg : 'Not found', 404);

export const InternalServerError = msg =>
  new ServerError(msg ? msg : 'Internal server error', 500);
