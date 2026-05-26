import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la empresa es requerido' })
  nombre!: string;

  @IsString()
  @IsNotEmpty({ message: 'El RFC es requerido' })
  @Length(12, 13, { message: 'El RFC debe tener entre 12 y 13 caracteres' })
  rfc!: string;
}
