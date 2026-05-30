import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Sucursale } from 'src/sucursales/entities/sucursales.entity';
// Asegúrate de tener export class Sucursal {} en su archivo
@Entity('empleados')
export class Empleado {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  // Hacemos estos campos opcionales y sin restricciones de relación
  @Column({ type: 'varchar', length: 36, nullable: true })
  tenant_id!: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  sucursal_id!: string | null;

  @Column({ type: 'varchar', length: 150 })
  nombre_completo!: string;

  @Column({ type: 'varchar', length: 18, unique: true })
  curp!: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  nss!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salario_diario!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  puesto!: string;

  // --- Datos Biométricos e IA ---
  @Column({ type: 'varchar', length: 255, nullable: true })
  foto_perfil_url!: string;

  @Column({ type: 'json', nullable: true })
  face_embedding!: any;

  @Column({ type: 'boolean', default: true })
  estatus!: boolean;

  // ✨ NUEVA COLUMNA: Identificador único opcional para empleados autorizados
  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  user!: string | null;

  // ✨ NUEVA COLUMNA: Hash de contraseña con espacio seguro para bcrypt
  @Column({ type: 'varchar', length: 255, nullable: true })
  password_hash!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  // --- Relaciones ---
  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'tenant_id' })
  empresa!: Empresa;

  @ManyToOne(() => Sucursale)
  @JoinColumn({ name: 'sucursal_id' })
  sucursal!: Sucursale;
}
