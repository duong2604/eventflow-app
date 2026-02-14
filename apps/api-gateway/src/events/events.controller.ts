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
import { EventsService } from './events.service';
import { CreateEventDto } from '@app/common/dto/create-event.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateEventDto } from '@app/common/dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-event')
  findMyEvent(@Req() req: { user: { userId: string; role?: string } }) {
    return this.eventsService.findMyEvent(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createEventDto: CreateEventDto,
    @Req() req: { user: { userId: string; role?: string } },
  ) {
    return this.eventsService.create(
      createEventDto,
      req.user.userId,
      req.user.role || 'USER',
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: { user: { userId: string; role?: string } },
  ) {
    return this.eventsService.update(
      updateEventDto,
      id,
      req.user.userId,
      req.user.role || 'USER',
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/publish')
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: { userId: string; role?: string } },
  ) {
    return this.eventsService.publish(
      id,
      req.user.userId,
      req.user.role || 'USER',
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: { userId: string; role?: string } },
  ) {
    return this.eventsService.cancel(
      id,
      req.user.userId,
      req.user.role || 'USER',
    );
  }
}
