import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';

@Entity('sucursales')
export class Sucursale {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  tenant_id!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  direccion?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  // --- Relación ---
  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'tenant_id' })
  empresa!: Empresa;
}