import { PurchaseTicketDto } from '@app/common/dto';
import { DatabaseService, events, tickets } from '@app/database';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomBytes } from 'crypto';
import { and, eq, sql } from 'drizzle-orm';

@Injectable()
export class TicketsServiceService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly dbService: DatabaseService,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  private generateTicketCode(): string {
    return randomBytes(6).toString().toUpperCase();
  }

  async purchase(purchaseDto: PurchaseTicketDto, userId: string) {
    //Step 1: Check exited event for purchasing
    const { eventId, quantity } = purchaseDto;
    const [event] = await this.dbService.db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Not found event!');
    }

    //Step 2: Is the event published
    if (event.status != 'PUBLISHED') {
      throw new BadRequestException('The event is not available!');
    }
    //step 3: Check quantity < remaining
    const soldTicket = await this.dbService.db
      .select({
        total: sql<number>`COALESCE(SUM(${tickets.quantity}), 0)`,
      })
      .from(tickets)
      .where(
        and(eq(tickets.eventId, eventId), eq(tickets.status, 'CONFIRMED')),
      );
    const currentSold = Number(soldTicket[0].total || 0);
    const remaining = event.capacity - currentSold;

    if (quantity > remaining) {
      throw new BadRequestException(`only ${remaining} tickets remaining`);
    }
    //step 4: Insert ticket into db

    const [ticket] = await this.dbService.db
      .insert(tickets)
      .values({
        eventId,
        userId,
        quantity,
        totalPrice: quantity * event.price,
        ticketCode: this.generateTicketCode(),
        status: 'CONFIRMED',
      })
      .returning();

    //step 5: Emit the ticket event to Kafka
    this.kafkaClient.emit(KAFKA_TOPICS.TICKET_PURCHASED, {
      ticketId: ticket.id,
      eventId: ticket.eventId,
      userId: ticket.userId,
      quantity: ticket.quantity,
      totalPrice: ticket.totalPrice,
      ticketCode: ticket.ticketCode,
      timestamp: new Date().toISOString(),
    });
  }

  async findMyTicket(userId: string) {
    const userTickets = await this.dbService.db
      .select()
      .from(tickets)
      .innerJoin(events, eq(events.id, tickets.eventId))
      .where(eq(tickets.userId, userId));

    return userTickets;
  }

  async findOne(ticketId: string, userId: string) {
    const [ticket] = await this.dbService.db
      .select({
        id: tickets.id,
        ticketCode: tickets.ticketCode,
        quantity: tickets.quantity,
        totalPrice: tickets.totalPrice,
        status: tickets.status,
        purchasedAt: tickets.purchasedAt,
        checkedInAt: tickets.checkedInAt,
        userId: tickets.userId,
        eventId: events.id,
        eventTitle: events.title,
        eventDate: events.date,
        eventLocation: events.location,
      })
      .from(tickets)
      .innerJoin(events, eq(events.id, tickets.id))
      .where(and(eq(tickets.id, ticketId), eq(tickets.userId, userId)))
      .limit(1);

    if (!ticket) {
      throw new NotFoundException('Ticket not found!');
    }

    if (ticket.userId != userId) {
      throw new ForbiddenException('Ticket does not belong to user');
    }

    return ticket;
  }

  async cancel(id: string, userId: string) {
    const [ticket] = await this.dbService.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);

    if (!ticket) {
      throw new NotFoundException('Ticket not found!');
    }

    if (ticket.userId != userId) {
      throw new ForbiddenException('Ticket does not belong to user');
    }

    if (ticket.status === 'CANCELLED') {
      throw new BadRequestException('Ticket is already cancelled');
    }

    if (ticket.status === 'CHECKED_IN') {
      throw new BadRequestException('Ticket is already checked in');
    }

    const [cancelled] = await this.dbService.db
      .update(tickets)
      .set({ status: 'CANCELLED', updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.TICKET_CANCELLED, {
      ticketId: cancelled.id,
      userId: cancelled.userId,
      eventId: cancelled.eventId,
      timestamp: new Date().toISOString(),
    });

    return { message: 'Ticket cancelled successfully!' };
  }

  async checkIn(id: string, organizerId: string) {
    const [ticket] = await this.dbService.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);

    if (!ticket) {
      throw new NotFoundException('Ticket not found!');
    }

    const [event] = await this.dbService.db
      .select()
      .from(events)
      .where(eq(events.id, ticket.eventId))
      .limit(1);

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'You are not authorized to check in this ticket',
      );
    }

    if (ticket.status === 'CHECKED_IN') {
      throw new BadRequestException('Ticket is already checked in');
    }

    if (ticket.status === 'CANCELLED') {
      throw new BadRequestException('Ticket is already cancelled');
    }

    const [checkedIn] = await this.dbService.db
      .update(tickets)
      .set({ status: 'CHECKED_IN', updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.TICKET_CHECKED_IN, {
      ticketId: checkedIn.id,
      eventId: checkedIn.eventId,
      userId: checkedIn.userId,
      timestamp: new Date().toISOString(),
    });

    return {
      message: 'Ticket checked in successfully',
      ticket: {
        id: checkedIn.id,
        ticketCode: checkedIn.ticketCode,
        quantity: checkedIn.quantity,
        status: checkedIn.status,
        checkedInAt: checkedIn.checkedInAt,
      },
    };
  }

  async findEventTickets(eventId: string, organizerId: string) {
    const [event] = await this.dbService.db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Event not found!');
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'You are not authorized to check in this event',
      );
    }

    const eventTickets = await this.dbService.db
      .select()
      .from(tickets)
      .where(eq(tickets.eventId, eventId));

    return eventTickets;
  }
}
