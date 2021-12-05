import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('signup')
  signup(): Promise<object> | object {
    return {};
  }
}
