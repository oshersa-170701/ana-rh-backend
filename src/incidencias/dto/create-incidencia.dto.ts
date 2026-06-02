import { IsNotEmpty, IsEnum, IsNumber, IsUUID, Matches, IsOptional, IsString, MinLength } from 'class-validator';
import { TipoIncidencia } from '../entities/incidencia.entity';

export class CreateIncidenciaDto {
  @IsUUID('4', { message: 'El tenant_id debe ser un UUID válido' })
  @IsNotEmpty()
  tenant_id!: string;

  @IsUUID('4', { message: 'El empleado_id debe ser un UUID válido' })
  @IsNotEmpty()
  empleado_id!: string;

  @IsEnum(TipoIncidencia, { message: 'Tipo de incidencia inválido' })
  @IsNotEmpty()
  tipo!: TipoIncidencia;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  @IsNotEmpty()
  fecha!: string;

  @IsNumber({}, { message: 'La cantidad de horas debe ser un número' })
  @IsOptional()
  cantidad_horas?: number;
  // 🔥 NUEVA PROPIEDAD: Valida la justificación obligatoria enviada por el Supervisor
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El motivo es requerido' })
  @MinLength(10, { message: 'El motivo debe tener al menos 10 caracteres' })
  motivo!: string;
  // ✨ AHORA ES OBLIGATORIO: Almacena directamente qué supervisor creó el registro
  @IsUUID('4', { message: 'El ID del supervisor debe ser un UUID válido' })
  @IsNotEmpty()
  aprobado_por!: string;
}