import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaDto } from './create-empresa.dto';
import { IsBoolean, IsOptional } from 'class-validator'; // 👈 Importamos los decoradores

export class UpdateEmpresaDto extends PartialType(CreateEmpresaDto) {
  
  @IsBoolean({ message: 'El estatus debe ser un valor booleano' })
  @IsOptional() // 👈 Es opcional por si en algún flujo de tu API no lo mandas
  estatus?: boolean;

}