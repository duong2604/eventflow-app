import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event';

export class UpdateEventDo extends PartialType(CreateEventDto) {}
