import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class BenchmarkInterceptor implements NestInterceptor {
  private readonly logger = new Logger('RequestLatency');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();

    const { method, url } = request;

    const start = performance.now();

    return next.handle().pipe(
      tap(() => {
        const time = (performance.now() - start).toFixed(2);
        this.logger.log(`⚡ [${method} ${url}] completed in: ${time}ms`);
      }),
    );
  }
}
