import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIncidenciaDto } from './dto/create-incidencia.dto';
import { UpdateIncidenciaDto } from './dto/update-incidencia.dto';
import { EstatusIncidencia, Incidencia } from './entities/incidencia.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class IncidenciasService {
  constructor(
    @InjectRepository(Incidencia)
    private readonly incidenciaRepository: Repository<Incidencia>,
  ) { }

  async create(createIncidenciaDto: CreateIncidenciaDto) {
    const nuevaIncidencia = this.incidenciaRepository.create({
      id: randomUUID(),
      ...createIncidenciaDto,
      estatus: EstatusIncidencia.APROBADO, // 🔥 PARCHE DE ORO: Forzamos que siempre sea APROBADO en la inserción
    });
    return await this.incidenciaRepository.save(nuevaIncidencia);
  }

  async findAll() {
    return await this.incidenciaRepository.find();
  }

  async findOne(id: string) {
    const incidencia = await this.incidenciaRepository.findOneBy({ id });
    if (!incidencia) {
      throw new NotFoundException(
        `La incidencia con ID ${id} no fue encontrada`,
      );
    }
    return incidencia;
  }

  async update(id: string, updateIncidenciaDto: UpdateIncidenciaDto) {
    const incidencia = await this.findOne(id);
    Object.assign(incidencia, updateIncidenciaDto);
    return await this.incidenciaRepository.save(incidencia);
  }

  async remove(id: string) {
    const incidencia = await this.findOne(id);
    return await this.incidenciaRepository.remove(incidencia);
  }
async findBySucursal(tenant_id: string, sucursal_id: string) {
    return await this.incidenciaRepository.find({
      where: {
        tenant_id,
        empleado: { sucursal_id } // Filter estrictamente por la sucursal del empleado
      },
      relations: {
        empleado: true,  // Para mostrar foto, nombre y puesto del afectado
        aprobador: true, // Para auditar qué supervisor la cargó
      },
      order: {
        fecha: 'DESC', // Las más recientes primero
      }
    });
  }
}
