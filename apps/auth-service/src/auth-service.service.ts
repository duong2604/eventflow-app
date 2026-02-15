import { DatabaseService, users } from '@app/database';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import {
  ConflictException,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthServiceService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly dbService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  // Connect to Kafka when the module is initialized.
  // NOTE: We only call connect() here, NOT subscribeToResponseOf().
  // subscribeToResponseOf is for request-response (send/reply) pattern.
  // We use fire-and-forget (emit), so no reply topic is needed.
  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async register(email: string, name: string, password: string) {
    // Check email existed
    const existingUsing = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUsing.length > 0) {
      throw new ConflictException('User already existed!');
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const [user] = await this.dbService.db
      .insert(users)
      .values({ email, name, password: hashedPassword })
      .returning();

    // Send a message to kafka

    this.kafkaClient.emit(KAFKA_TOPICS.USER_REGISTERED, {
      userId: user.id,
      email: user.email,
      name: user.name,
      timestamp: new Date().toISOString(),
    });

    return { message: 'User registered successfully!' };
  }

  async login(email: string, password: string) {
    // Check user exited
    const [user] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    const token = this.jwtService.sign({ userId: user.id, role: user.role });

    // Send a new message to kafka
    this.kafkaClient.emit(KAFKA_TOPICS.USER_LOGIN, {
      userId: user.id,
      timestamp: new Date().toISOString(),
    });
    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getProfile(userId: string) {
    const [user] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
