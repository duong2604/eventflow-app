import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthServiceModule } from './auth-service.module';
import { SERVICES_PORTS } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(SERVICES_PORTS.AUTH_SERVICE);
  console.log(`Auth service running on port ${SERVICES_PORTS.AUTH_SERVICE}`);
}

bootstrap();
