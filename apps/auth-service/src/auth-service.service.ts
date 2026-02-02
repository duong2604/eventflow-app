import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AuthServiceService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(KAFKA_TOPICS.USER_REGISTERED);
    // Connect to Kafka when the module is initialized
    await this.kafkaClient.connect();
  }

  simulateUserRegistration(email: string) {
    this.kafkaClient.emit(KAFKA_TOPICS.USER_REGISTERED, {
      email,
      timeStamp: new Date().toISOString(),
    });

    return { message: 'User registration simulated', email };
  }
}
