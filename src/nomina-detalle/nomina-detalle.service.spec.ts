import { Test, TestingModule } from '@nestjs/testing';
import { NominaDetalleService } from './nomina-detalle.service';

describe('NominaDetalleService', () => {
  let service: NominaDetalleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NominaDetalleService],
    }).compile();

    service = module.get<NominaDetalleService>(NominaDetalleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
