import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('empresas')
export class Empresa {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 13, unique: true })
  rfc!: string;
  // 🚀 ¡COLUMNA DE ORO COMPLETADA! Agregamos el soporte para logos en MySQL
// 🚀 ACTUALIZACIÓN DE CAPACIDAD: Cambiamos a longtext para almacenar el Base64 completo
  @Column({ type: 'longtext', nullable: true })
  logo_url!: string;
  @Column({ type: 'boolean', default: true })
  estatus!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}
