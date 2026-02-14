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
export class EventsService {
  private readonly eventServiceUrl = `http://localhost:${SERVICES_PORTS.EVENTS_SERVICE}`;
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly httpService: HttpService) {}

  async findAll(): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.eventServiceUrl}`).pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleHttpError(error, 'GET_PUBLISHED_EVENT');
        }),
      ),
    );

    return response.data;
  }

  async findMyEvent(userId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService
        .get(`${this.eventServiceUrl}/my-event`, {
          headers: {
            'x-user-id': userId,
          },
        })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.handleHttpError(error, 'GET_MY_EVENT');
          }),
        ),
    );

    return response.data;
  }

  async findOne(id: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.eventServiceUrl}/${id}`).pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleHttpError(error, 'GET_ONE_EVENT');
        }),
      ),
    );

    return response.data;
  }

  async create(
    data: object,
    userId: string,
    userRole: string,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService
        .post(`${this.eventServiceUrl}`, data, {
          headers: {
            'x-user-id': userId,
            'x-user-role': userRole,
          },
        })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.handleHttpError(error, 'CREATE_EVENT');
          }),
        ),
    );
    return response.data;
  }

  async update(
    data: object,
    id: string,
    userId: string,
    userRole: string,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.patch(`${this.eventServiceUrl}/${id}`, data, {
        headers: {
          'x-user-id': userId,
          'x-user-role': userRole,
        },
      }),
    );

    return response.data;
  }

  async publish(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.eventServiceUrl}/${id}/publish`,
        {},
        {
          headers: {
            'x-user-id': userId,
            'x-user-role': userRole,
          },
        },
      ),
    );

    return response.data;
  }

  async cancel(id: string, userId: string, userRole: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.eventServiceUrl}/${id}/cancel`,
        {},
        {
          headers: {
            'x-user-id': userId,
            'x-user-role': userRole,
          },
        },
      ),
    );

    return response.data;
  }

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
}
