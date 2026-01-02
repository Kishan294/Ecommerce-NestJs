import { Injectable } from '@nestjs/common';

/**
 * The main service for the application's root endpoint.
 */
@Injectable()
export class AppService {
  /**
   * Returns a hello message.
   * @returns A string with a greeting.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
