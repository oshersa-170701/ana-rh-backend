import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NominaDetalleService } from './nomina-detalle.service';
import { CreateNominaDetalleDto } from './dto/create-nomina-detalle.dto';
import { UpdateNominaDetalleDto } from './dto/update-nomina-detalle.dto';

@Controller('nomina-detalle')
export class NominaDetalleController {
  constructor(private readonly nominaDetalleService: NominaDetalleService) {}

  @Post()
  create(@Body() createNominaDetalleDto: CreateNominaDetalleDto) {
    return this.nominaDetalleService.create(createNominaDetalleDto);
  }

  @Get()
  findAll() {
    return this.nominaDetalleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nominaDetalleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNominaDetalleDto: UpdateNominaDetalleDto) {
    return this.nominaDetalleService.update(+id, updateNominaDetalleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nominaDetalleService.remove(+id);
  }
}
