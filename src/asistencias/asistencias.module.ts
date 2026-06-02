import { Module } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { AsistenciasController } from './asistencias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asistencia } from './entities/asistencia.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { Incidencia } from 'src/incidencias/entities/incidencia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asistencia,Empleado,Incidencia])], // ¡Registramos el repositorio!
  controllers: [AsistenciasController],
  providers: [AsistenciasService],
  exports: [AsistenciasService] // Por si llegas a ocuparlo en otro lado después
})
export class AsistenciasModule {}
