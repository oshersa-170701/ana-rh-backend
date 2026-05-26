import { Test, TestingModule } from '@nestjs/testing';
import { NominasService } from './nominas.service';

describe('NominasService', () => {
  let service: NominasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NominasService],
    }).compile();

    service = module.get<NominasService>(NominasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
