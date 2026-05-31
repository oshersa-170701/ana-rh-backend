import { Type } from "class-transformer";
import { IsOptional, IsString, IsNotEmpty, Length, IsNumber, IsBoolean, ValidateIf } from "class-validator";
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

  @Transform((params) =>
    params.value === '' || params.value === null ? undefined : params.value,
  )
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

  // ✨ NUEVO CAMPO: Solo requerido cuando lo crea el Superadmin (Mínimo 4 letras)
  @Transform((params) =>
    params.value === '' || params.value === null || params.value === 'undefined'
      ? undefined
      : params.value,
  )
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.user !== undefined && o.user !== null && o.user !== '') // 👈 BLINDAJE DE ORO
  @Length(4, 100, { message: 'El usuario debe tener al menos 4 caracteres' })
  user?: string;

  // ✨ NUEVO CAMPO: Solo requerido cuando lo crea el Superadmin (Mínimo 6 letras)
  @Transform((params) => (params.value === '' || params.value === null || params.value === 'undefined' ? undefined : params.value))
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.password_hash !== undefined && o.password_hash !== null && o.password_hash !== '') // 👈 BLINDAJE DE ORO
  @Length(6, 255, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password_hash?: string;

  // ✨ NUEVO CAMPO DECLARADO: Permite que pasen los filtros de validación 400
  @IsOptional()
  @IsBoolean({ message: 'El estatus debe ser un valor booleano' })
  @Transform(({ value }) => value === 'true' || value === true) // Asegura el casteo correcto si viene de FormData
  estatus?: boolean;
}