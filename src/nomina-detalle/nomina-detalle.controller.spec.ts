import { Test, TestingModule } from '@nestjs/testing';
import { NominaDetalleController } from './nomina-detalle.controller';
import { NominaDetalleService } from './nomina-detalle.service';

describe('NominaDetalleController', () => {
  let controller: NominaDetalleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NominaDetalleController],
      providers: [NominaDetalleService],
    }).compile();

    controller = module.get<NominaDetalleController>(NominaDetalleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
