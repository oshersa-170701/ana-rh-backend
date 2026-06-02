import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { CheckAsistenciaDto } from './dto/check-asistencia.dto';

@Controller('asistencias')
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  @Post()
  create(@Body() createAsistenciaDto: CreateAsistenciaDto) {
    return this.asistenciasService.create(createAsistenciaDto);
  }

  @Get()
  findAll() {
    return this.asistenciasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.asistenciasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAsistenciaDto: UpdateAsistenciaDto,
  ) {
    return this.asistenciasService.update(id, updateAsistenciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.asistenciasService.remove(id);
  }
  // 🤖 ✨ ENDPOINT DE ACCESO PARA EL KIOSCO BIOMÉTRICO
  @Post('checar-ia')
  registrarChecadaIA(@Body() checkAsistenciaDto: CheckAsistenciaDto) {
    return this.asistenciasService.registrarChecadaAutomatica(
      checkAsistenciaDto,
    );
  }
  @Get('sucursal/:tenantId/:sucursalId')
  findBySucursal(
    @Param('tenantId') tenantId: string,
    @Param('sucursalId') sucursalId: string,
  ) {
    return this.asistenciasService.findBySucursal(tenantId, sucursalId);
  }
}
