import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt'; // 👈 Importamos bcrypt

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    // 1. Generamos el "salt" (el nivel 10 es el estándar recomendado para equilibrio entre seguridad y velocidad)
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    // 2. Encriptamos la contraseña que viene del DTO
    const hashedPassword = await bcrypt.hash(
      createUsuarioDto.password_hash,
      salt,
    );

    // 3. Creamos el usuario reemplazando la contraseña original por la encriptada
    const nuevoUsuario = this.usuarioRepository.create({
      id: randomUUID(),
      ...createUsuarioDto,
      password_hash: hashedPassword, // 👈 ¡Magia aplicada!
    });

    return await this.usuarioRepository.save(nuevoUsuario);
  }

  async findAll() {
    return await this.usuarioRepository.find();
  }

  async findOne(id: string) {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`El usuario con ID ${id} no fue encontrado`);
    }
    return usuario;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);
    
    // Opcional: Si en el futuro permites actualizar la contraseña, aquí también deberías encriptarla antes de guardar
    if (updateUsuarioDto.password_hash) {
      const salt = await bcrypt.genSalt(10);
      updateUsuarioDto.password_hash = await bcrypt.hash(
        updateUsuarioDto.password_hash,
        salt,
      );
    }

    Object.assign(usuario, updateUsuarioDto);
    return await this.usuarioRepository.save(usuario);
  }

  async remove(id: string) {
    const usuario = await this.findOne(id);
    return await this.usuarioRepository.remove(usuario);
  }
}