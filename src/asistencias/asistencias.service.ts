import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { Asistencia } from './entities/asistencia.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class AsistenciasService {
  constructor(
    @InjectRepository(Asistencia)
    private readonly asistenciaRepository: Repository<Asistencia>,
  ) {}

  async create(createAsistenciaDto: CreateAsistenciaDto) {
    const nuevaAsistencia = this.asistenciaRepository.create({
      id: randomUUID(),
      ...createAsistenciaDto,
    });
    return await this.asistenciaRepository.save(nuevaAsistencia);
  }

  async findAll() {
    return await this.asistenciaRepository.find();
  }

  async findOne(id: string) {
    const asistencia = await this.asistenciaRepository.findOneBy({ id });
    if (!asistencia) {
      throw new NotFoundException(
        `La asistencia con ID ${id} no fue encontrada`,
      );
    }
    return asistencia;
  }

  async update(id: string, updateAsistenciaDto: UpdateAsistenciaDto) {
    const asistencia = await this.findOne(id);
    Object.assign(asistencia, updateAsistenciaDto);
    return await this.asistenciaRepository.save(asistencia);
  }

  async remove(id: string) {
    const asistencia = await this.findOne(id);
    return await this.asistenciaRepository.remove(asistencia);
  }
}
