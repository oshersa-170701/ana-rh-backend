import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('empresas')
export class Empresa {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 13, unique: true })
  rfc!: string;

  @Column({ type: 'boolean', default: true })
  estatus!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}
