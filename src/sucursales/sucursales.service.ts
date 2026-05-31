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
    // ✨ Cambiado de ['empresa'] a un objeto con tipado seguro
    return await this.sucursalRepository.find({
      relations: {
        empresa: true
      }
    });
  }

  async findOne(id: string) {
    // ✨ Cambiado también aquí para cumplir con el tipado estricto
    const sucursal = await this.sucursalRepository.findOne({
      where: { id },
      relations: {
        empresa: true
      }
    });
    
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
  // ✨ NUEVO MÉTODO: Query directa a MySQL filtrando por la empresa activa
  async findByTenant(tenantId: string) {
    return await this.sucursalRepository.find({
      where: { 
        // Ajusta 'tenant_id' si en tu entidad se llama de otra forma (ej. tenant: { id: tenantId })
        tenant_id: tenantId 
      },
      relations: {
        empresa: true
      }
    });
  }
}