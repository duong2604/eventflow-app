import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { HttpModule } from '@nestjs/axios';
import { TicketService } from './tickets.service';

@Module({
  imports: [HttpModule],
  controllers: [TicketsController],
  providers: [TicketService],
})
export class TicketsModule {}
