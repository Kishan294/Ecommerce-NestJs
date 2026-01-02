import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter to catch all unhandled exceptions.
 * Logs the error and returns a standardized JSON response.
 */
@Catch() // Catch everything
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    /**
     * Catches and processes an exception.
     * @param exception The exception being thrown.
     * @param host ArgumentHost to access the execution context.
     */
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse =
            exception instanceof HttpException
                ? exception.getResponse()
                : { message: (exception as Error).message || 'Internal server error' };

        const message =
            typeof exceptionResponse === 'string'
                ? exceptionResponse
                : (exceptionResponse as any).message;

        this.logger.error(
            `${request.method} ${request.url} -> ${status} error: ${JSON.stringify(message)}`,
            exception instanceof Error ? exception.stack : undefined,
        );

        response.status(status).json({
            statusCode: status,
            message,
            error: (exceptionResponse as any).error || (status === 500 ? 'InternalServerError' : 'Error'),
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}