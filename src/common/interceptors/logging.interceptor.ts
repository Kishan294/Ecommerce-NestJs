import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor that logs the details of every incoming request and its completion duration.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    /**
     * Intercepts a request to log duration and status code.
     * @param context Execution context.
     * @param next Call handler.
     * @returns Observable of the response.
     */
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();
        const request = context.switchToHttp().getRequest();

        const { method, url } = request;
        this.logger.log(`Incoming request: ${method} ${url}`);

        return next.handle().pipe(
            tap(() => {
                const response = context.switchToHttp().getResponse();
                const { statusCode } = response;
                const duration = Date.now() - now;
                this.logger.log(
                    `${method} ${url} -> ${statusCode} (${duration}ms)`,
                );
            }),
        );
    }
}