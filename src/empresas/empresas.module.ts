import { Module } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { EmpresasController } from './empresas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Empresa])], // ¡Esto le da acceso al repositorio de Empresas!
  controllers: [EmpresasController],
  providers: [EmpresasService],
})
export class EmpresasModule {}
