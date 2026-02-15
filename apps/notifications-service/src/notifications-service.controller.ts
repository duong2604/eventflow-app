import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx } from '@nestjs/microservices';
import { KafkaContext } from '@nestjs/microservices';
import { KAFKA_TOPICS } from '@app/kafka';
import { NotificationsServiceService } from './notifications-service.service';

@Controller()
export class NotificationsServiceController {
  private readonly logger = new Logger(NotificationsServiceController.name);

  constructor(
    private readonly notificationsService: NotificationsServiceService,
  ) {}

  @Get('health')
  healthCheck() {
    return { status: 'okay', service: 'Notification service' };
  }

  @EventPattern(KAFKA_TOPICS.USER_REGISTERED)
  async handleUserRegistered(
    @Payload() data: { userId: string; email: string; name: string },
    @Ctx() context: KafkaContext,
  ) {
    const topic = context.getTopic();
    const message = JSON.stringify(context.getMessage());
    this.logger.log(`[${topic}]: ${message}`);

    await this.notificationsService.sendWelcomeEmail(data);
  }

  @EventPattern(KAFKA_TOPICS.TICKET_PURCHASED)
  async handleTicketPurchased(
    @Payload()
    data: {
      userId: string;
      email?: string;
      ticketCode: string;
      eventTitle?: string;
      quantity: number;
      totalPrice: number;
    },
    @Ctx() context: KafkaContext,
  ) {
    const topic = context.getTopic();
    const message = JSON.stringify(context.getMessage());
    this.logger.log(`[${topic}]: ${message}`);

    await this.notificationsService.sendTicketPurchasedEmail(data);
  }

  @EventPattern(KAFKA_TOPICS.TICKET_CANCELLED)
  async handleTicketCancelled(
    @Payload() data: { ticketId: string; userId: string },
  ) {
    this.logger.log(
      `Received ticket cancellation event: ${JSON.stringify(data)}`,
    );

    await this.notificationsService.sendTicketCancelledEmail(data);
  }
}
