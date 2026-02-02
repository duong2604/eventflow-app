import { Body, Controller, Post } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @Post('register')
  register(@Body() data: { email: string }) {
    return this.authServiceService.simulateUserRegistration(data.email);
  }
}
