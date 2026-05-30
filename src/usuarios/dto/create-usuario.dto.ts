import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El usuario es obligatorio' })
  user!: string; // 👈 Cambiado de email a user

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty()
  password_hash!: string;
}