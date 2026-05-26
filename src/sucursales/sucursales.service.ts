import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSucursaleDto } from './dto/create-sucursale.dto';
import { UpdateSucursaleDto } from './dto/update-sucursale.dto';
import { randomUUID } from 'crypto';
import { Sucursale } from './entities/sucursales.entity';

@Injectable()
export class SucursalesService {
  constructor(
    @InjectRepository(Sucursale)
    private readonly sucursalRepository: Repository<Sucursale>,
  ) {}

  async create(createSucursaleDto: CreateSucursaleDto) {
    const nuevaSucursal = this.sucursalRepository.create({
      id: randomUUID(),
      ...createSucursaleDto,
    });
    return await this.sucursalRepository.save(nuevaSucursal);
  }

  async findAll() {
    return await this.sucursalRepository.find();
  }

  async findOne(id: string) {
    const sucursal = await this.sucursalRepository.findOneBy({ id });
    if (!sucursal) {
      throw new NotFoundException(`La sucursal con ID ${id} no fue encontrada`);
    }
    return sucursal;
  }

  async update(id: string, updateSucursaleDto: UpdateSucursaleDto) {
    const sucursal = await this.findOne(id);
    Object.assign(sucursal, updateSucursaleDto);
    return await this.sucursalRepository.save(sucursal);
  }

  async remove(id: string) {
    const sucursal = await this.findOne(id);
    return await this.sucursalRepository.remove(sucursal);
  }
}