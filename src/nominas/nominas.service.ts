import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNominaDto } from './dto/create-nomina.dto';
import { UpdateNominaDto } from './dto/update-nomina.dto';
import { Nomina } from './entities/nomina.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class NominasService {
  constructor(
    @InjectRepository(Nomina)
    private readonly nominaRepository: Repository<Nomina>,
  ) {}

  async create(createNominaDto: CreateNominaDto) {
    const nuevaNomina = this.nominaRepository.create({
      id: randomUUID(),
      ...createNominaDto,
    });
    return await this.nominaRepository.save(nuevaNomina);
  }

  async findAll() {
    return await this.nominaRepository.find();
  }

  async findOne(id: string) {
    const nomina = await this.nominaRepository.findOneBy({ id });
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
}