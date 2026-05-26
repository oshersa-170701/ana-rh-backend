import { IsString, IsNotEmpty, IsEmail, IsEnum, IsUUID, MinLength, IsOptional } from 'class-validator';
import { RolUsuario } from '../entities/usuario.entity';

export class CreateUsuarioDto {
  @IsUUID('4', { message: 'El tenant_id debe ser un UUID válido' })
  @IsNotEmpty()
  tenant_id!: string;

  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty()
  password_hash!: string;

  @IsEnum(RolUsuario, { message: 'Rol de usuario inválido' })
  @IsNotEmpty()
  rol!: RolUsuario;
  @IsString()
  @IsOptional()
  foto_perfil_url?: string;

  @IsOptional()
  face_embedding?: any;
}