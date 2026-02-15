import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TicketsServiceService } from './tickets-service.service';
import { CheckInTicketDto, PurchaseTicketDto } from '@app/common/dto';

@Controller()
export class TicketsServiceController {
  constructor(private readonly ticketsServiceService: TicketsServiceService) {}

  @Post('purchase')
  purchase(
    @Body() purchaseDto: PurchaseTicketDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.ticketsServiceService.purchase(purchaseDto, userId);
  }

  @Get('my-tickets')
  findMyTicket(@Headers('x-user-id') userId: string) {
    return this.ticketsServiceService.findMyTickets(userId);
  }

  @Get(':id')
  findOne(
    @Param(':id', ParseUUIDPipe) ticketId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.ticketsServiceService.findOne(ticketId, userId);
  }

  @Patch('check-in')
  checkIn(
    @Param('x-user-id') organizerId: string,
    @Body() checkInTicketDto: CheckInTicketDto,
  ) {
    return this.ticketsServiceService.checkIn(organizerId, checkInTicketDto);
  }

  @Patch(':id/cancel')
  cancel(
    @Param(':id', ParseUUIDPipe) ticketId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.ticketsServiceService.cancel(ticketId, userId);
  }

  @Patch('event/:eventId')
  findEventTickets(
    @Param(':eventId', ParseUUIDPipe) eventId: string,
    @Headers('x-user-id') organizerId: string,
  ) {
    return this.ticketsServiceService.findEventTickets(eventId, organizerId);
  }
}
