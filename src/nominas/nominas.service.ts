import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Between } from 'typeorm'; 
import { CreateNominaDto } from './dto/create-nomina.dto';
import { UpdateNominaDto } from './dto/update-nomina.dto';
import { EstatusNomina, Nomina } from './entities/nomina.entity';
import { randomUUID } from 'crypto';
import { NominaDetalle } from 'src/nomina-detalle/entities/nomina-detalle.entity';

@Injectable()
export class NominasService {
  constructor(
    @InjectRepository(Nomina)
    private readonly nominaRepository: Repository<Nomina>,
    @InjectRepository(NominaDetalle)
    private readonly detalleRepository: Repository<NominaDetalle>, 
    private readonly dataSource: DataSource,
  ) {}

  async create(createNominaDto: CreateNominaDto) {
    const { tenant_id, periodo_inicio, periodo_fin } = createNominaDto;

    // 1. Evitar traslape de fechas para el mismo tenant
    const nominaExistente = await this.nominaRepository.findOne({
      where: { tenant_id, periodo_inicio, periodo_fin },
    });

    if (nominaExistente) {
      throw new BadRequestException('Ya existe un período de nómina registrado exactamente para estas fechas.');
    }

    // 2. Creamos el registro de la nómina global
    const nuevaNomina = this.nominaRepository.create({
      id: randomUUID(),
      ...createNominaDto,
      estatus: EstatusNomina.BORRADOR,
    });

    const nominaGuardada = await this.nominaRepository.save(nuevaNomina);

    // 🚀 3. GENERACIÓN EN CASCADA AUTOMÁTICA: Calculamos y congelamos los desgloses por empleado
    const empleados = await this.dataSource.getRepository('Empleado').find({
      where: { tenant_id: nominaGuardada.tenant_id, estatus: true }
    });

    await Promise.all(
      empleados.map(async (empleado: any) => {
        // A) Contar asistencias
        const asistencias = await this.dataSource.getRepository('Asistencia').count({
          where: {
            empleado_id: empleado.id,
            fecha: Between(nominaGuardada.periodo_inicio, nominaGuardada.periodo_fin),
            tipo_evento: 'ENTRADA'
          }
        });

        // B) Consultar incidencias aprobadas
        const incidencias = await this.dataSource.getRepository('Incidencia').find({
          where: {
            empleado_id: empleado.id,
            fecha: Between(nominaGuardada.periodo_inicio, nominaGuardada.periodo_fin),
            estatus: 'APROBADO'
          }
        });

        const totalHorasExtra = incidencias
          .filter(i => i.tipo === 'HORA_EXTRA')
          .reduce((sum, i) => sum + Number(i.cantidad_horas), 0);

        const totalFaltas = incidencias.filter(i => i.tipo === 'FALTA').length;

        // C) Algoritmo de cálculo económico
        const salarioDiario = Number(empleado.salario_diario) || 0;
        const pagoBase = asistencias * salarioDiario;
        const valorHoraExtra = (salarioDiario / 8) * 2; 
        const pagoHorasExtra = totalHorasExtra * valorHoraExtra;
        const totalNeto = pagoBase + pagoHorasExtra;

        // D) Guardado persistente e histórico conectado a la entidad correcta 🎯
        const nuevoDetalle = this.detalleRepository.create({
          id: randomUUID(),
          nomina_id: nominaGuardada.id,
          empleado_id: empleado.id,
          dias_asistidos: asistencias,
          faltas: totalFaltas,
          horas_extra: totalHorasExtra,
          pago_base: pagoBase,
          pago_horas_extra: pagoHorasExtra,
          total_neto: totalNeto
        });

        await this.detalleRepository.save(nuevoDetalle);
      })
    );

    // Retornamos la nómina con sus detalles recién inyectados
    return this.findOne(nominaGuardada.id);
  }

  async findByTenant(tenantId: string) {
    return await this.nominaRepository.find({
      where: { tenant_id: tenantId },
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: string) {
    const nomina = await this.nominaRepository.findOne({
      where: { id },
      relations: {
        detalles: {
          empleado: true 
        }
      }
    });

    if (!nomina) {
      throw new NotFoundException(`La nómina con ID ${id} no fue encontrada`);
    }
    return nomina;
  }

  async update(id: string, updateNominaDto: UpdateNominaDto) {
    const nomina = await this.findOne(id);
    Object.assign(nomina, updateNominaDto);
    return await this.nominaRepository.save(nomina);
  }

  async remove(id: string) {
    const nomina = await this.findOne(id);
    return await this.nominaRepository.remove(nomina);
  }
  // 🔒 MÉTODO DE AUDITORÍA: Cierra el período y congela los datos permanentemente
  async actualizarEstatus(id: string, nuevoEstatus: EstatusNomina) {
    const nomina = await this.nominaRepository.findOne({
      where: { id },
      relations: { detalles: true } // Jalamos los detalles para validar que no esté vacía
    });

    if (!nomina) {
      throw new NotFoundException(`La nómina con ID ${id} no fue encontrada`);
    }

    // Validación de seguridad: Si ya fue PAGADA, ya no se puede mover a ningún otro estado
    if (nomina.estatus === EstatusNomina.PAGADA) {
      throw new BadRequestException('Esta nómina ya ha sido pagada y archivada. No se permiten más modificaciones.');
    }

    // Validación de negocio: No se puede cerrar una nómina que no tiene desgloses de empleados
    if (!nomina.detalles || nomina.detalles.length === 0) {
      throw new BadRequestException('No se puede cerrar una nómina que no contiene desgloses de empleados.');
    }

    // Actualizamos el estatus de forma estricta
    nomina.estatus = nuevoEstatus;
    return await this.nominaRepository.save(nomina);
  }
}