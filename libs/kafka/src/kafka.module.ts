import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  KAFKA_BROKER,
  KAFKA_CLIENT_ID,
  KAFKA_CONSUMER_GROUP,
} from './constants/kafka.constant';
import { KafkaAdminService } from './kafka.service';

export const KAFKA_SERVICE = 'KAFKA_SERVICE';

@Module({})
export class KafkaModule {
  static register(consumerGroup?: string): DynamicModule {
    return {
      module: KafkaModule,
      imports: [
        ClientsModule.register([
          {
            name: 'KAFKA_SERVICE',
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: KAFKA_CLIENT_ID,
                brokers: [KAFKA_BROKER],
                retry: {
                  initialRetryTime: 300,
                  retries: 10,
                },
              },
              producer: {
                allowAutoTopicCreation: true,
              },
              consumer: {
                groupId: consumerGroup ?? KAFKA_CONSUMER_GROUP,
              },
            },
          },
        ]),
      ],
      providers: [KafkaAdminService],
      exports: [ClientsModule, KafkaAdminService],
    };
  }
}
