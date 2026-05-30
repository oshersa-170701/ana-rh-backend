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
  @UseInterceptors(FileInterceptor('foto')) // 👈 Agregamos el interceptor para capturar la nueva foto si es que viene
  update(
    @Param('id') id: string,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto,
    @UploadedFile() foto?: Express.Multer.File // 👈 Opcional usando el operador "?"
  ) {
    // Si viene una foto nueva, se la inyectamos al DTO antes de mandarlo al servicio
    if (foto) {
      updateEmpleadoDto.foto_perfil_url = undefined; // Le indicamos al servicio que guarde la nueva imagen
    }
    return this.empleadosService.update(id, { ...updateEmpleadoDto, nuevaFotoArchivo: foto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadosService.remove(id);
  }
  @Post('reconocer')
  async reconocer(@Body() body: { descriptor: number[] }) {
    return this.empleadosService.reconocerRostro(body.descriptor);
  }
}
