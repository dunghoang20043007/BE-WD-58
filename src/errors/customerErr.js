import { ReasonPhrases, StatusCodes } from "http-status-codes";

export class HttpException extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}

export class NotFoundError extends HttpException {
    constructor(message) {
        super(message);
        this.name = ReasonPhrases.NOT_FOUND;
        this.status = StatusCodes.NOT_FOUND;
    }
}
export class BadRequestError extends HttpException {
    constructor(message) {
        super(message);
        this.name = ReasonPhrases.BAD_REQUEST;
        this.status = StatusCodes.BAD_REQUEST;
    }
}
export class DuplicateError extends HttpException {
    constructor(message) {
        super(message);
        this.name = ReasonPhrases.CONFLICT;
        this.status = StatusCodes.CONFLICT;
    }
}
export class UnAuthenticatedError extends HttpException {
    constructor(message) {
        super(message);
        this.name = ReasonPhrases.UNAUTHORIZED;
        this.status = StatusCodes.UNAUTHORIZED;
    }
}
export class UnAuthorizedError extends HttpException {
    constructor(message) {
        super(message);
        this.name = ReasonPhrases.FORBIDDEN;
        this.status = StatusCodes.FORBIDDEN;
    }
}

export class NotAcceptableError extends HttpException {
    constructor(message) {
        super(message);
        this.name = ReasonPhrases.NOT_ACCEPTABLE;
        this.status = StatusCodes.NOT_ACCEPTABLE;
    }
}
