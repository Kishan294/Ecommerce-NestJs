import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * The main controller for the application's root endpoint.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  /**
   * Returns a hello message.
   * @returns A string with a greeting.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
