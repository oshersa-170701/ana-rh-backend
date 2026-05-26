import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';

export enum EstatusNomina {
  BORRADOR = 'BORRADOR',
  TIMBRADA = 'TIMBRADA',
  PAGADA = 'PAGADA',
}

@Entity('nominas')
export class Nomina {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  tenant_id!: string;

  @Column({ type: 'date' })
  periodo_inicio!: string;

  @Column({ type: 'date' })
  periodo_fin!: string;

  @Column({
    type: 'enum',
    enum: EstatusNomina,
    default: EstatusNomina.BORRADOR,
  })
  estatus!: EstatusNomina;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  // --- Relación ---
  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'tenant_id' })
  empresa!: Empresa;
}