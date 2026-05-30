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
  ) { }

 async create(createUsuarioDto: CreateUsuarioDto) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(createUsuarioDto.password_hash, salt);

  const nuevoUsuario = this.usuarioRepository.create({
    id: randomUUID(),
    user: createUsuarioDto.user, // 👈 Mapeamos user
    password_hash: hashedPassword,
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
  async verificarAcceso(user: string, passwordPlana: string) {
  // 1. Buscamos el registro por la columna 'user'
  const usuario = await this.usuarioRepository.findOneBy({ user });
  
  if (!usuario) {
    return { autenticado: false, mensaje: 'Usuario no encontrado' };
  }

  // 2. Comparamos el texto plano del front con el hash de la BD
  const coincide = await bcrypt.compare(passwordPlana, usuario.password_hash);
  
  if (!coincide) {
    return { autenticado: false, mensaje: 'Contraseña incorrecta' };
  }

  // 3. Si todo está bien, retornamos éxito y un token simulado
  return {
    autenticado: true,
    token: 'token_maestro_superadmin_' + usuario.id,
    user: usuario.user
  };
}
}