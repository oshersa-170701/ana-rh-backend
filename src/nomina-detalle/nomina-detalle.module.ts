import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NominaDetalle } from './entities/nomina-detalle.entity'; // 👈 IMPORTANTE
import { Nomina } from 'src/nominas/entities/nomina.entity';
import { NominasService } from 'src/nominas/nominas.service';
import { NominasController } from 'src/nominas/nominas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Nomina, NominaDetalle])], // 🧠 Ambos repositorios registrados
  controllers: [NominasController],
  providers: [NominasService],
  exports: [NominasService]
})
export class NominasModule {}