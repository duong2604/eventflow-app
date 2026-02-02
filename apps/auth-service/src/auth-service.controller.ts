import { Body, Controller, Post } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { LoginDto, RegisterDto } from '@app/common/dto';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @Post('register')
  register(@Body() data: RegisterDto) {
    return this.authServiceService.register(
      data.email,
      data.name,
      data.password,
    );
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authServiceService.login(dto.email, dto.password);
  }
}
