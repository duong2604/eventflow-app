import { Module } from '@nestjs/common';
import { EventsServiceController } from './events-service.controller';
import { EventsServiceService } from './events-service.service';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from '@app/kafka';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    KafkaModule.register('event-service-group'),
    DatabaseModule,
  ],
  controllers: [EventsServiceController],
  providers: [EventsServiceService],
})
export class EventsServiceModule {}
