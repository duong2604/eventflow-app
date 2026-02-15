import { PurchaseTicketDto } from '@app/common/dto';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TicketService } from './tickets.service';

@Controller('tickets')
@UseGuards(AuthGuard('jwt'))
export class TicketsController {
  constructor(private readonly ticketService: TicketService) {}

  @Post('purchase')
  purchase(
    @Body() data: PurchaseTicketDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.ticketService.purchase(data, req.user.userId);
  }

  @Get('my-tickets')
  findMyTickets(@Req() req: { user: { userId: string } }) {
    return this.ticketService.findMyTickets(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.ticketService.findOne(id, req.user.userId);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.ticketService.cancel(id, req.user.userId);
  }
  @Get('event/:eventId')
  findEventTickets(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.ticketService.findEventTickets(eventId, req.user.userId);
  }
}
