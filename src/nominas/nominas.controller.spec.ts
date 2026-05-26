import { Test, TestingModule } from '@nestjs/testing';
import { NominasController } from './nominas.controller';
import { NominasService } from './nominas.service';

describe('NominasController', () => {
  let controller: NominasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NominasController],
      providers: [NominasService],
    }).compile();

    controller = module.get<NominasController>(NominasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
