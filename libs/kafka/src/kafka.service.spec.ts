import { Test, TestingModule } from '@nestjs/testing';
import { KafkaAdminService } from './kafka.service';

// Note: This test requires a running Kafka broker or should be
// integration-tested. For unit tests, mock the Kafka admin client.
describe('KafkaAdminService', () => {
  let service: KafkaAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KafkaAdminService],
    }).compile();

    service = module.get<KafkaAdminService>(KafkaAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
