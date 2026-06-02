import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { NominasService } from './nominas.service';
import { CreateNominaDto } from './dto/create-nomina.dto';
import { UpdateNominaDto } from './dto/update-nomina.dto';
import { EstatusNomina } from './entities/nomina.entity';

@Controller('nominas')
export class NominasController {
  constructor(private readonly nominasService: NominasService) {}

  @Post()
  create(@Body() createNominaDto: CreateNominaDto) {
    return this.nominasService.create(createNominaDto);
  }

  // 🚀 GET /nominas?tenant_id=xxxx-xxxx (Optimizado y protegido para Multi-tenant)
  @Get()
  findAll(@Query('tenant_id') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('El parámetro tenant_id es estrictamente obligatorio para consultar las nóminas.');
    }
    return this.nominasService.findByTenant(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nominasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNominaDto: UpdateNominaDto) {
    return this.nominasService.update(id, updateNominaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nominasService.remove(id);
  }
  @Patch(':id/estatus')
  actualizarEstatus(
    @Param('id') id: string,
    @Body('estatus') estatus: EstatusNomina
  ) {
    return this.nominasService.actualizarEstatus(id, estatus);
  }
}