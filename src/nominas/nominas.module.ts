import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NominasService } from './nominas.service';
import { NominasController } from './nominas.controller';
import { Nomina } from './entities/nomina.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nomina])],
  controllers: [NominasController],
  providers: [NominasService],
})
export class NominasModule {}