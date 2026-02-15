import { SERVICES_PORTS } from '@app/common';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';

interface HttpErrorResponse {
  response?: {
    status: number;
    data?: { message?: string };
  };
  request?: unknown;
  message?: string;
}

@Injectable()
export class TicketService {
  private readonly ticketServiceUrl = `http://localhost:${SERVICES_PORTS.TICKETS_SERVICE}`;
  private readonly logger = new Logger(TicketService.name);

  constructor(private readonly httpService: HttpService) {}

  private handleHttpError(error: HttpErrorResponse, operation: string): never {
    // Downstream service
    if (error.response) {
      const status = error.response.status;
      const message = error.response?.data?.message ?? `${operation} failed`;

      this.logger.warn(
        `[${operation}] Downstream error:  ${status} - ${message}`,
      );

      throw new HttpException(message, status);
    }
    // Network error, timeout
    if (error.request) {
      this.logger.error(
        `[${operation}] No response from event service: ${error.message}`,
      );
      throw new HttpException(
        'Event service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    // Request setup failed
    this.logger.error(`[${operation}] Request setup failed: ${error.message}`);
    throw new HttpException(
      `Internal server error`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async purchase(data: object, userId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService
        .post(`${this.ticketServiceUrl}/purchase`, data, {
          headers: {
            'x-user-id': userId,
          },
        })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.handleHttpError(error, 'PURCHASE_TICKET');
          }),
        ),
    );

    return response.data;
  }

  async findMyTickets(userId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService
        .get(`${this.ticketServiceUrl}/my-tickets`, {
          headers: {
            'x-user-id': userId,
          },
        })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.handleHttpError(error, 'FIND_MY_TICKETS');
          }),
        ),
    );

    return response.data;
  }

  async findOne(ticketId: string, userId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService
        .get(`${this.ticketServiceUrl}/${ticketId}`, {
          headers: {
            'x-user-id': userId,
          },
        })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.handleHttpError(error, 'FIND_ONE_TICKET');
          }),
        ),
    );
    return response.data;
  }

  async cancel(ticketId: string, userId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService
        .patch(
          `${this.ticketServiceUrl}/${ticketId}/cancel`,
          {},
          {
            headers: {
              'x-user-id': userId,
            },
          },
        )
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.handleHttpError(error, 'CANCEL_TICKET');
          }),
        ),
    );

    return response.data;
  }

  async findEventTickets(eventId: string, userId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService
        .get(`${this.ticketServiceUrl}/event/${eventId}`, {
          headers: {
            'x-user-id': userId,
          },
        })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.handleHttpError(error, 'FIND_EVENT_TICKETS');
          }),
        ),
    );
    return response.data;
  }
}
