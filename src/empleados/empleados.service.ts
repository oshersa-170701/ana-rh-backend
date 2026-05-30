import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import * as bcrypt from 'bcrypt'; // 👈 Importamos bcrypt para proteger los accesos

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
  ) { }

  async create(dto: any, foto: Express.Multer.File) {
    const fotoUrl = await this.guardarFoto(foto);
    const embedding = dto.face_embedding ? JSON.parse(dto.face_embedding) : null;

    // ✨ LIMPIEZA: Convertimos strings vacíos de FormData a null de forma dinámica
    const usuario = dto.user && dto.user.trim() !== '' ? dto.user.trim() : null;
    let contraseniaHash = dto.password_hash && dto.password_hash.trim() !== '' ? dto.password_hash : null;

    // ✨ ENCRIPTA: Si el Superadmin asignó contraseña, le aplicamos hash seguro
    if (contraseniaHash) {
      const salt = await bcrypt.genSalt(10);
      contraseniaHash = await bcrypt.hash(contraseniaHash, salt);
    }

    const nuevoEmpleado = this.empleadoRepository.create({
      id: crypto.randomUUID(),
      nombre_completo: dto.nombre_completo,
      curp: dto.curp,
      nss: dto.nss && dto.nss.trim() !== '' ? dto.nss : null,
      salario_diario: dto.salario_diario,
      puesto: dto.puesto,
      foto_perfil_url: fotoUrl,
      face_embedding: embedding,
      estatus: true,
      tenant_id: dto.tenant_id && dto.tenant_id.trim() !== '' ? dto.tenant_id : null,
      sucursal_id: dto.sucursal_id && dto.sucursal_id.trim() !== '' ? dto.sucursal_id : null,
      user: usuario,            // Guardará el string o null limpio sin romper el UNIQUE
      password_hash: contraseniaHash // Guardará el hash de bcrypt o null limpio
    });

    return await this.empleadoRepository.save(nuevoEmpleado);
  }

  async update(id: string, dto: any) {
    const empleado = await this.empleadoRepository.findOneBy({ id });
    if (!empleado) throw new NotFoundException('Empleado no encontrado');

    const datosActualizados = { ...dto };

    // ✨ PROCESAR FOTO NUEVA SI SE SUBIÓ EN LA EDICIÓN:
    if (datosActualizados.nuevaFotoArchivo) {
      const nuevaRutaFoto = await this.guardarFoto(datosActualizados.nuevaFotoArchivo);
      empleado.foto_perfil_url = nuevaRutaFoto;
      delete datosActualizados.nuevaFotoArchivo;
    }

    if (datosActualizados.user !== undefined) {
      datosActualizados.user = datosActualizados.user && datosActualizados.user.trim() !== '' ? datosActualizados.user.trim() : null;
    }

    if (datosActualizados.password_hash && datosActualizados.password_hash.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      datosActualizados.password_hash = await bcrypt.hash(datosActualizados.password_hash, salt);
    } else if (datosActualizados.password_hash === '') {
      datosActualizados.password_hash = null;
    }

    Object.assign(empleado, datosActualizados);
    return await this.empleadoRepository.save(empleado);
  }

  private async guardarFoto(foto: Express.Multer.File): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads', 'perfiles');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const nombreUnico = `${crypto.randomUUID()}.jpg`;
    const filePath = path.join(uploadDir, nombreUnico);
    await sharp(foto.buffer).resize(300, 300).jpeg({ quality: 80 }).toFile(filePath);
    return `uploads/perfiles/${nombreUnico}`;
  }

  async reconocerRostro(descriptor: number[]) {
    const empleados = await this.empleadoRepository.find({
      where: { face_embedding: Not(IsNull()) }
    });

    let mejorCoincidencia: Empleado | null = null;
    let distanciaMinima = 0.6;

    for (const empleado of empleados) {
      const embedding = Array.isArray(empleado.face_embedding) ? empleado.face_embedding : JSON.parse(empleado.face_embedding);
      const dist = Math.sqrt(descriptor.reduce((sum, val, i) => sum + Math.pow(val - embedding[i], 2), 0));

      if (dist < distanciaMinima) {
        distanciaMinima = dist;
        mejorCoincidencia = empleado;
      }
    }

    if (!mejorCoincidencia) throw new NotFoundException('No reconocido');
  
    return { 
      nombre: mejorCoincidencia.nombre_completo, 
      puesto: mejorCoincidencia.puesto,
      curp: mejorCoincidencia.curp 
    };
  }

  async findAll() { 
    // ✨ Agregamos de una vez la carga relacional para que tu tabla muestre las empresas y sucursales
    return await this.empleadoRepository.find({
      relations: {
        empresa: true,
        sucursal: true
      }
    }); 
  }

  async findOne(id: string) { 
    return await this.empleadoRepository.findOne({ 
      where: { id },
      relations: { empresa: true, sucursal: true }
    }); 
  }

  async remove(id: string) { 
    // 1. Buscamos el empleado en la base de datos para recuperar la ruta de su foto
    const empleado = await this.empleadoRepository.findOneBy({ id });
    
    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado');
    }

    // 2. Si el empleado cuenta con una foto guardada, intentamos eliminarla físicamente
    if (empleado.foto_perfil_url) {
      // Reconstruimos la ruta absoluta uniendo el directorio actual del proyecto con la ruta de la BD
      const rutaFisicaFoto = path.join(process.cwd(), empleado.foto_perfil_url);

      try {
        // Validamos de forma segura si el archivo realmente existe en el disco antes de borrarlo
        if (fs.existsSync(rutaFisicaFoto)) {
          fs.unlinkSync(rutaFisicaFoto); // 🔥 Borra el archivo físico inmediatamente
          console.log(`Foto eliminada correctamente del servidor: ${rutaFisicaFoto}`);
        }
      } catch (error) {
        // Si por alguna razón falla (permisos, archivo abierto, etc.), lo reportamos sin tumbar el flujo
        console.error(`No se pudo eliminar el archivo físico en el servidor:`, error);
      }
    }

    // 3. Una vez limpio el almacenamiento local, procedemos a borrar el registro de MySQL
    return await this.empleadoRepository.delete(id); 
  }
}