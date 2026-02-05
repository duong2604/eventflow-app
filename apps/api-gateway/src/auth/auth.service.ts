import { SERVICES_PORTS } from '@app/common';
import { LoginDto, RegisterDto } from '@app/common/dto';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';

interface HttpErrorResponse {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  request?: unknown;
  message?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly authServiceUrl = `http://localhost:${SERVICES_PORTS.AUTH_SERVICE}`;

  constructor(private readonly httpService: HttpService) {}

  async register(data: RegisterDto): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService
        .post<unknown>(`${this.authServiceUrl}/register`, data)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.handleHttpError(error, 'register');
          }),
        ),
    );

    return response.data;
  }

  async login(data: LoginDto): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.post<unknown>(`${this.authServiceUrl}/login`, data).pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleHttpError(error, 'login');
        }),
      ),
    );

    return response.data;
  }

  async getProfile(authorization: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService
        .get<unknown>(`${this.authServiceUrl}/profile`, {
          headers: {
            Authorization: authorization,
          },
        })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.handleHttpError(error, 'getProfile');
          }),
        ),
    );

    return response.data;
  }

  private handleHttpError(error: HttpErrorResponse, operation: string): never {
    // Downstream service responded with an error (4xx, 5xx)
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message ?? `${operation} failed`;

      this.logger.warn(
        `[${operation}] Downstream error: ${status} - ${message}`,
      );
      throw new HttpException(message, status);
    }

    // Request was made but no response received (network error, timeout)
    if (error.request) {
      this.logger.error(
        `[${operation}] No response from auth service: ${error.message}`,
      );
      throw new HttpException(
        'Auth service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Request setup failed
    this.logger.error(`[${operation}] Request setup failed: ${error.message}`);
    throw new HttpException(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
