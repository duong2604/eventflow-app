import { CreateEventDto } from '@app/common/dto/create-event';
import { UpdateEventDto } from '@app/common/dto/update_event';
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
import { EventsServiceService } from './events-service.service';

@Controller()
export class EventsServiceController {
  constructor(private readonly eventsServiceService: EventsServiceService) {}

  @Get()
  findAll() {
    return this.eventsServiceService.findAll();
  }

  @Get('my-event')
  findMyEvent(@Headers('x-user-id') userId: string) {
    return this.eventsServiceService.findMyEvent(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsServiceService.findOne(id);
  }

  @Post()
  create(
    @Body() createEventDto: CreateEventDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.eventsServiceService.create(createEventDto, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user_role') userRole: string,
  ) {
    return this.eventsServiceService.update(
      id,
      updateEventDto,
      userId,
      userRole,
    );
  }

  @Patch(':id/publish')
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    return this.eventsServiceService.publish(id, userId, userRole);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    return this.eventsServiceService.cancel(id, userId, userRole);
  }
}
