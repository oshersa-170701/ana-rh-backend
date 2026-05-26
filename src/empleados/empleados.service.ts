import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
  ) { }

  async create(dto: any, foto: Express.Multer.File) {
    const fotoUrl = await this.guardarFoto(foto);

  // Si recibimos el embedding del front, lo usamos, si no, null.
  // Asegúrate de parsearlo si llega como string del FormData
  const embedding = dto.face_embedding ? JSON.parse(dto.face_embedding) : null;
    const nuevoEmpleado = this.empleadoRepository.create({
      ...dto,
      id: crypto.randomUUID(),
      foto_perfil_url: fotoUrl,
      face_embedding: embedding, // Aquí se guarda el array de 128 números
      estatus: true,
      tenant_id: dto.tenant_id || '1',
      sucursal_id: dto.sucursal_id || '1'
    });
    return await this.empleadoRepository.save(nuevoEmpleado);
  }

  private async guardarFoto(foto: Express.Multer.File): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads', 'perfiles');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const nombreUnico = `${crypto.randomUUID()}.jpg`;
    const filePath = path.join(uploadDir, nombreUnico);
    await sharp(foto.buffer).resize(300, 300).jpeg({ quality: 80 }).toFile(filePath);
    return `uploads/perfiles/${nombreUnico}`;
  }

  // Comparación matemática pura (sin librerías de IA)
  async reconocerRostro(descriptor: number[]) {
    const empleados = await this.empleadoRepository.find({
      where: { face_embedding: Not(IsNull()) }
    });

    let mejorCoincidencia: Empleado | null = null;
    let distanciaMinima = 0.6;

    for (const empleado of empleados) {
      const embedding = Array.isArray(empleado.face_embedding) ? empleado.face_embedding : JSON.parse(empleado.face_embedding);

      // Cálculo de distancia euclidiana manual
      const dist = Math.sqrt(descriptor.reduce((sum, val, i) => sum + Math.pow(val - embedding[i], 2), 0));

      if (dist < distanciaMinima) {
        distanciaMinima = dist;
        mejorCoincidencia = empleado;
      }
    }

    if (!mejorCoincidencia) throw new NotFoundException('No reconocido');
    return { nombre: mejorCoincidencia.nombre_completo, puesto: mejorCoincidencia.puesto };
  }

  async findAll() { return await this.empleadoRepository.find(); }
  async findOne(id: string) { return await this.empleadoRepository.findOneBy({ id }); }
  async update(id: string, dto: any) { return await this.empleadoRepository.update(id, dto); }
  async remove(id: string) { return await this.empleadoRepository.delete(id); }
}