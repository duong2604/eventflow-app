import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { KAFKA_BROKER, KAFKA_CLIENT_ID, KAFKA_TOPICS } from './constants';

@Injectable()
export class KafkaAdminService implements OnModuleInit {
  private readonly logger = new Logger(KafkaAdminService.name);

  async onModuleInit() {
    await this.createTopics();
  }

  private async createTopics(): Promise<void> {
    const kafka = new Kafka({
      clientId: `${KAFKA_CLIENT_ID}-admin`,
      brokers: [KAFKA_BROKER],
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    });

    const admin = kafka.admin();

    try {
      await admin.connect();

      const topicNames = Object.values(KAFKA_TOPICS);

      const created = await admin.createTopics({
        waitForLeaders: true,
        topics: topicNames.map((topic) => ({
          topic,
          numPartitions: 3,
          replicationFactor: 1,
        })),
      });

      if (created) {
        this.logger.log(
          `Created ${topicNames.length} Kafka topics: ${topicNames.join(', ')}`,
        );
      } else {
        this.logger.log('All Kafka topics already exist');
      }
    } catch (error) {
      this.logger.error('Failed to create Kafka topics', error);
      throw error;
    } finally {
      await admin.disconnect();
    }
  }
}
