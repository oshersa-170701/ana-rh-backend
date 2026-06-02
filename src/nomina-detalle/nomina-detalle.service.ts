import { Injectable } from '@nestjs/common';
import { CreateNominaDetalleDto } from './dto/create-nomina-detalle.dto';
import { UpdateNominaDetalleDto } from './dto/update-nomina-detalle.dto';

@Injectable()
export class NominaDetalleService {
  create(createNominaDetalleDto: CreateNominaDetalleDto) {
    return 'This action adds a new nominaDetalle';
  }

  findAll() {
    return `This action returns all nominaDetalle`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nominaDetalle`;
  }

  update(id: number, updateNominaDetalleDto: UpdateNominaDetalleDto) {
    return `This action updates a #${id} nominaDetalle`;
  }

  remove(id: number) {
    return `This action removes a #${id} nominaDetalle`;
  }
}
