import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NominasService } from './nominas.service';
import { NominasController } from './nominas.controller';
import { Nomina } from './entities/nomina.entity';
import { NominaDetalle } from 'src/nomina-detalle/entities/nomina-detalle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nomina,NominaDetalle])],
  controllers: [NominasController],
  providers: [NominasService],
})
export class NominasModule {}