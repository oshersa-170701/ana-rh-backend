import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Empleado } from '../../empleados/entities/empleado.entity';
// Asegúrate de tener export class Usuario {} en su archivo
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum TipoIncidencia {
  FALTA = 'FALTA',
  RETARDO = 'RETARDO',
  HORA_EXTRA = 'HORA_EXTRA',
  PERMISO = 'PERMISO',
  VACACIONES = 'VACACIONES',
}

export enum EstatusIncidencia {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

@Entity('incidencias')
export class Incidencia {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  tenant_id!: string;

  @Column({ type: 'varchar', length: 36 })
  empleado_id!: string;

  @Column({ type: 'enum', enum: TipoIncidencia })
  tipo!: TipoIncidencia;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  cantidad_horas!: number;
  // 🔥 NUEVA COLUMNA: Mapea la justificación con la base de datos
  @Column({ type: 'text', nullable: true })
  motivo!: string;
  @Column({
    type: 'enum',
    enum: EstatusIncidencia,
    default: EstatusIncidencia.APROBADO, // 🔥 PARCHE DE ORO: Entra aprobada por defecto
  })
  estatus!: EstatusIncidencia;

  @Column({ type: 'varchar', length: 36, nullable: false }) // ✨ Ya no es nullable
  aprobado_por!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  // --- Relaciones ---
  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'tenant_id' })
  empresa!: Empresa;

  @ManyToOne(() => Empleado)
  @JoinColumn({ name: 'empleado_id' })
  empleado!: Empleado;

  // ✅ POR ESTO (Para que acepte IDs de la tabla empleados):
  @ManyToOne(() => Empleado)
  @JoinColumn({ name: 'aprobado_por' })
  aprobador!: Empleado;
}
