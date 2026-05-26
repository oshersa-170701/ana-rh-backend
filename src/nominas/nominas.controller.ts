import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NominasService } from './nominas.service';
import { CreateNominaDto } from './dto/create-nomina.dto';
import { UpdateNominaDto } from './dto/update-nomina.dto';

@Controller('nominas')
export class NominasController {
  constructor(private readonly nominasService: NominasService) {}

  @Post()
  create(@Body() createNominaDto: CreateNominaDto) {
    return this.nominasService.create(createNominaDto);
  }

  @Get()
  findAll() {
    return this.nominasService.findAll();
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
}