import { IsNotEmpty, IsString } from 'class-validator';

export class CheckInTicketDto {
  @IsString({ message: 'Ticket code must be string' })
  @IsNotEmpty({ message: 'Ticket code must be required' })
  ticketCode: string;
}
