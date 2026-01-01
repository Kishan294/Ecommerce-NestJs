import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        const message =
            typeof exceptionResponse === 'string'
                ? exceptionResponse
                : (exceptionResponse as any).message;

        this.logger.error(
            `${request.method} ${request.url} -> ${status} error: ${JSON.stringify(message)}`,
        );

        response.status(status).json({
            statusCode: status,
            message,
            error: (exceptionResponse as any).error || HttpException.name,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}