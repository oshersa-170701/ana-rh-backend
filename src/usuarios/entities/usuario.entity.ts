import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';

export enum RolUsuario {
  ADMIN_EMPRESA = 'ADMIN_EMPRESA',
  RH = 'RH',
  SUPERVISOR = 'SUPERVISOR',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  tenant_id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({ type: 'enum', enum: RolUsuario })
  rol!: RolUsuario;
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  foto_perfil_url?: string;

  @Column({ type: 'json', nullable: true })
  face_embedding?: any;
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  // --- Relación ---
  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'tenant_id' })
  empresa!: Empresa;
}