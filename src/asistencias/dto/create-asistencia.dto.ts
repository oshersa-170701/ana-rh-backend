import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsUUID,
  Matches,
} from 'class-validator';
import { TipoEvento, MetodoValidacion } from '../entities/asistencia.entity';

export class CreateAsistenciaDto {
  @IsUUID('4', { message: 'El tenant_id debe ser un UUID válido' })
  @IsNotEmpty()
  tenant_id!: string;

  @IsUUID('4', { message: 'El empleado_id debe ser un UUID válido' })
  @IsNotEmpty()
  empleado_id!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fecha!: string;

  @IsEnum(TipoEvento, { message: 'Tipo de evento inválido' })
  @IsNotEmpty()
  tipo_evento!: TipoEvento;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'La hora debe tener formato HH:MM:SS',
  })
  hora!: string;

  @IsString()
  @IsOptional()
  foto_evidencia_url?: string;

  @IsEnum(MetodoValidacion)
  @IsOptional()
  metodo_validacion?: MetodoValidacion;

  @IsNumber()
  @IsOptional()
  score_confianza_ia?: number;
}
