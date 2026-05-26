import { Type } from "class-transformer";
import { IsOptional, IsString, IsNotEmpty, Length, IsNumber } from "class-validator";
import { Transform } from 'class-transformer';
export class CreateEmpleadoDto {
  // Hacemos ambos opcionales y permitimos que sean strings o nulos
  @IsOptional()
  @IsString()
  tenant_id?: string;

  @IsOptional()
  @IsString()
  sucursal_id?: string;
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  nombre_completo!: string;

  @IsString()
  @Length(18, 18, { message: 'El CURP debe tener exactamente 18 caracteres' })
  @IsNotEmpty()
  curp!: string;

  @Transform((params) => (params.value === '' || params.value === null ? undefined : params.value))
  @IsString()
  @Length(11, 11, { message: 'El NSS debe tener exactamente 11 caracteres' })
  @IsOptional()
  nss?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'El salario diario debe ser un número' })
  @IsNotEmpty()
  salario_diario!: number;

@Transform((params) => (params.value === '' || params.value === null ? undefined : params.value))
  @IsString()
  @IsOptional()
  puesto?: string;

  @IsOptional()
  foto_perfil_url?: string;

  @IsOptional()
  face_embedding?: any;
}