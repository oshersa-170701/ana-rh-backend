import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'user' }) // 👈 Cambiado a user
  user!: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}