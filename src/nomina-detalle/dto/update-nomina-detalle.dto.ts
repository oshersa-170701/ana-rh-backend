import { PartialType } from '@nestjs/mapped-types';
import { CreateNominaDetalleDto } from './create-nomina-detalle.dto';

export class UpdateNominaDetalleDto extends PartialType(CreateNominaDetalleDto) {}
