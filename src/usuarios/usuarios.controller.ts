import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // 🚀 ENDPOINT SEMILLA: Crea el Superadmin inicial
  @Post('seed-admin')
  async seedAdmin() {
    const adminDto = {
      user: 'superadmin',
      password_hash: 'admin1234' // Contraseña inicial segura
    };
    
    // Verificamos primero si ya existen usuarios para no duplicar
    const usuarios = await this.usuariosService.findAll();
    if (usuarios.length > 0) {
      return { message: 'El sistema ya cuenta con usuarios registrados.' };
    }

    const creado = await this.usuariosService.create(adminDto as any);
    return {
      message: '¡Superadmin creado con éxito!',
      usuario: creado.user
    };
  }

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
  // Agrega esta ruta dentro de tu UsuariosController
@Post('login')
  async loginAdmin(@Body() body: { user: string; password_hash: string }) {
    const resultado = await this.usuariosService.verificarAcceso(body.user, body.password_hash);
    
    if (!resultado.autenticado) {
      // ✨ Corregido: Ya no usamos el import en línea
      throw new UnauthorizedException(resultado.mensaje);
    }

    return {
      token: resultado.token,
      user: resultado.user
    };
  }
}