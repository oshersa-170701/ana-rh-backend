import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
// Asegúrate de tener al menos export class Empleado {} en su archivo para que no marque error
import { Empleado } from '../../empleados/entities/empleado.entity';

export enum TipoEvento {
  ENTRADA = 'ENTRADA',
  INICIO_ALMUERZO = 'INICIO_ALMUERZO',
  FIN_ALMUERZO = 'FIN_ALMUERZO',
  SALIDA = 'SALIDA',
}

export enum MetodoValidacion {
  FACIAL = 'FACIAL',
  MANUAL = 'MANUAL',
}

@Entity('asistencias')
export class Asistencia {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  tenant_id!: string;

  @Column({ type: 'varchar', length: 36 })
  empleado_id!: string;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'enum', enum: TipoEvento })
  tipo_evento!: TipoEvento;

  @Column({ type: 'time' })
  hora!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  foto_evidencia_url!: string;

  @Column({
    type: 'enum',
    enum: MetodoValidacion,
    default: MetodoValidacion.FACIAL,
  })
  metodo_validacion!: MetodoValidacion;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score_confianza_ia!: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  // --- Relaciones ---
  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'tenant_id' })
  empresa!: Empresa;

  @ManyToOne(() => Empleado)
  @JoinColumn({ name: 'empleado_id' })
  empleado!: Empleado;
}
