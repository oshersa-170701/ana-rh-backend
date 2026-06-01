import { IsNotEmpty, IsUUID, IsOptional, IsNumber, IsString } from 'class-validator';

export class CheckAsistenciaDto {
  @IsUUID('4', { message: 'El empleado_id debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del empleado es requerido para registrar asistencia' })
  empleado_id!: string;

  @IsNumber({}, { message: 'El score de confianza debe ser un número' })
  @IsOptional()
  score_confianza_ia?: number;

  @IsString()
  @IsOptional()
  foto_evidencia_base64?: string; // Por si decides capturar la foto en el kiosco
}