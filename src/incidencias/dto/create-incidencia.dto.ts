import { IsNotEmpty, IsEnum, IsOptional, IsNumber, IsUUID, Matches } from 'class-validator';
import { TipoIncidencia, EstatusIncidencia } from '../entities/incidencia.entity';

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

  @IsEnum(EstatusIncidencia, { message: 'Estatus inválido' })
  @IsOptional()
  estatus?: EstatusIncidencia;

  @IsUUID('4', { message: 'El ID del aprobador debe ser un UUID válido' })
  @IsOptional()
  aprobado_por?: string;
}