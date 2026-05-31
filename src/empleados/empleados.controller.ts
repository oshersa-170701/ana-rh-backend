import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { validate } from 'class-validator'; // 👈 Y esto
import { FileInterceptor } from '@nestjs/platform-express'; // 👈 Importamos el interceptor de archivos
import { plainToInstance } from 'class-transformer';
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) { }
// En EmpleadosController.ts
@Post()
@UseInterceptors(FileInterceptor('foto'))
async create(@Body() body: any, @UploadedFile() foto: Express.Multer.File) {
  // Ya no necesitas calcular el descriptor aquí, el Service lo hará
  return this.empleadosService.create(body, foto);
}
@Get()
  findAll() {
    return this.empleadosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empleadosService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('foto')) // 👈 Atrapa el archivo binario 'foto' del FormData
  async update(
    @Param('id') id: string,
    @Body() body: any, // 👈 Cambiamos a 'any' temporalmente para recibir el body crudo del FormData sin que class-validator tumbe el archivo
    @UploadedFile() foto?: Express.Multer.File
  ) {
    // Si el supervisor subió una foto nueva, se la inyectamos directamente al body para que el servicio la procese
    if (foto) {
      body.nuevaFotoArchivo = foto;
    }

    // Despachamos el cuerpo limpio y sanitizado directamente hacia el servicio de TypeORM
    return this.empleadosService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadosService.remove(id);
  }
  @Post('reconocer')
  async reconocer(@Body() body: { descriptor: number[] }) {
    return this.empleadosService.reconocerRostro(body.descriptor);
  }
  // ✨ NUEVO ENDPOINT: Login exclusivo para empleados administradores
  @Post('login')
  async login(@Body() body: { user: string; password_hash: string }) {
    return this.empleadosService.loginEmpleado(body.user, body.password_hash);
  }
}
