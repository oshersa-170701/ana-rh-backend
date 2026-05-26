import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateSucursaleDto {
  @IsUUID('4', { message: 'El tenant_id debe ser un UUID válido' })
  @IsNotEmpty()
  tenant_id!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de la sucursal es requerido' })
  nombre!: string;

  @IsString()
  @IsOptional()
  direccion?: string;
}