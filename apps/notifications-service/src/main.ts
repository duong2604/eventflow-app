import { NestFactory } from '@nestjs/core';
import { NotificationsServiceModule } from './notifications-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { KAFKA_BROKER, KAFKA_CLIENT_ID } from '@app/kafka';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger(NotificationsServiceModule.name);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationsServiceModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: `${KAFKA_CLIENT_ID}-notification`,
          brokers: [KAFKA_BROKER],
        },
        consumer: {
          groupId: 'notification-consumer-group',
        },
      },
    },
  );

  await app.listen();
  logger.log('Notifications microservice is listening for Kafka events');
}
bootstrap();
