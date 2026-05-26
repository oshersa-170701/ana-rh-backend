import { IsNotEmpty, IsEnum, IsOptional, IsUUID, Matches } from 'class-validator';
import { EstatusNomina } from '../entities/nomina.entity';

export class CreateNominaDto {
  @IsUUID('4', { message: 'El tenant_id debe ser un UUID válido' })
  @IsNotEmpty()
  tenant_id!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'El periodo de inicio debe tener formato YYYY-MM-DD' })
  @IsNotEmpty()
  periodo_inicio!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'El periodo de fin debe tener formato YYYY-MM-DD' })
  @IsNotEmpty()
  periodo_fin!: string;

  @IsEnum(EstatusNomina, { message: 'Estatus de nómina inválido' })
  @IsOptional()
  estatus?: EstatusNomina;
}