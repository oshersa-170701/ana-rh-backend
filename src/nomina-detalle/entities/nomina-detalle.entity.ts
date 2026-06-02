import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Empleado } from '../../empleados/entities/empleado.entity';
import { Nomina } from 'src/nominas/entities/nomina.entity';

@Entity('nominas_detalles')
export class NominaDetalle {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  nomina_id!: string;

  @Column({ type: 'varchar', length: 36 })
  empleado_id!: string;

  @Column({ type: 'int', default: 0 })
  dias_asistidos!: number;

  @Column({ type: 'int', default: 0 })
  faltas!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  horas_extra!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pago_base!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pago_horas_extra!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_neto!: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  // --- Relaciones ---
  @ManyToOne(() => Nomina, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nomina_id' })
  nomina!: Nomina;

  @ManyToOne(() => Empleado)
  @JoinColumn({ name: 'empleado_id' })
  empleado!: Empleado;
}