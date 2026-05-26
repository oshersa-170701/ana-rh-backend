import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { Empresa } from './entities/empresa.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async create(createEmpresaDto: CreateEmpresaDto) {
    // Creamos la instancia y le generamos su UUID de 36 caracteres
    const nuevaEmpresa = this.empresaRepository.create({
      id: randomUUID(),
      ...createEmpresaDto,
    });

    // Guardamos en la base de datos
    return await this.empresaRepository.save(nuevaEmpresa);
  }

  async findAll() {
    return await this.empresaRepository.find();
  }

  async findOne(id: string) {
    const empresa = await this.empresaRepository.findOneBy({ id });
    if (!empresa) {
      throw new NotFoundException(`La empresa con ID ${id} no fue encontrada`);
    }
    return empresa;
  }

  async update(id: string, updateEmpresaDto: UpdateEmpresaDto) {
    const empresa = await this.findOne(id);
    // Object.assign actualiza solo los campos que vengan en el DTO
    Object.assign(empresa, updateEmpresaDto);
    return await this.empresaRepository.save(empresa);
  }

  async remove(id: string) {
    const empresa = await this.findOne(id);
    return await this.empresaRepository.remove(empresa);
  }
}
