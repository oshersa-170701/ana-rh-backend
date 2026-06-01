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

    // 1. 📸 Procesar foto nueva si se subió
    if (datosActualizados.nuevaFotoArchivo) {
      const nuevaRutaFoto = await this.guardarFoto(datosActualizados.nuevaFotoArchivo);
      empleado.foto_perfil_url = nuevaRutaFoto;
      delete datosActualizados.nuevaFotoArchivo;
    }

    // 2. 🛡️ Validadores seguros para campos opcionales del DTO
    if (datosActualizados.user !== undefined && datosActualizados.user !== null) {
      const userStr = String(datosActualizados.user).trim();
      datosActualizados.user = (userStr !== '' && userStr !== 'undefined') ? userStr : null;
    } else {
      delete datosActualizados.user;
    }

    if (datosActualizados.password_hash !== undefined && datosActualizados.password_hash !== null) {
      const passStr = String(datosActualizados.password_hash).trim();
      if (passStr !== '' && passStr !== 'undefined') {
        const salt = await bcrypt.genSalt(10);
        datosActualizados.password_hash = await bcrypt.hash(passStr, salt);
      } else {
        delete datosActualizados.password_hash;
      }
    } else {
      delete datosActualizados.password_hash;
    }

    // 🔥 3. EL PARCHE DE ORO PARA EL ESTATUS (Soluciona el error 500)
    // Traduce la cadena de texto "true" o "false" de FormData a un booleano primitivo de JS
    if (datosActualizados.estatus !== undefined && datosActualizados.estatus !== null) {
      const estatusStr = String(datosActualizados.estatus).trim();
      // Si es el string "true" o el número "1", la entidad recibe true, de lo contrario false
      datosActualizados.estatus = (estatusStr === 'true' || estatusStr === '1');
    }

    // 4. Limpieza de llaves foráneas corruptas por strings vacíos
    if (datosActualizados.tenant_id) {
      const tenantStr = String(datosActualizados.tenant_id).trim();
      if (tenantStr === '' || tenantStr === 'undefined') delete datosActualizados.tenant_id;
    }
    if (datosActualizados.sucursal_id) {
      const sucursalStr = String(datosActualizados.sucursal_id).trim();
      if (sucursalStr === '' || sucursalStr === 'undefined') delete datosActualizados.sucursal_id;
    }

    // 5. Acoplamos los cambios limpios y ordenados en la entidad original
    Object.assign(empleado, datosActualizados);
    
    // Al guardar un booleano real de JS (true/false), TypeORM escribe un 1 o 0 perfecto en MySQL
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
    let distanciaMinima = 0.6; // Umbral estricto de face-api

    for (const empleado of empleados) {
      const embedding = Array.isArray(empleado.face_embedding) 
        ? empleado.face_embedding 
        : JSON.parse(empleado.face_embedding);
        
      const dist = Math.sqrt(descriptor.reduce((sum, val, i) => sum + Math.pow(val - embedding[i], 2), 0));

      if (dist < distanciaMinima) {
        distanciaMinima = dist;
        mejorCoincidencia = empleado;
      }
    }

    if (!mejorCoincidencia) throw new NotFoundException('No reconocido');
  
    // ✨ CORRECCIÓN DE ORO: Enviamos el ID y tenant_id obligatorios para el Kiosco
    return { 
      id: mejorCoincidencia.id,
      tenant_id: mejorCoincidencia.tenant_id,
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
async loginEmpleado(user: string, passwordPlana: string) {
    // 1. Buscamos al empleado por su usuario único
    const empleado = await this.empleadoRepository.findOne({
      where: { user },
      relations: { sucursal: true, empresa: true }
    });

    // 2. Si no existe o está Inactivo, denegamos el acceso
    if (!empleado || !empleado.estatus) {
      throw new NotFoundException('Credenciales incorrectas o usuario inactivo');
    }

    // ✨ CORRECCIÓN: Validamos que tenga un password_hash real antes de usar bcrypt
    if (!empleado.password_hash) {
      throw new NotFoundException('Este usuario no cuenta con credenciales de acceso');
    }

    // 3. Ahora TypeScript sabe con 100% de certeza que es un string y no fallará
    const passwordValida = await bcrypt.compare(passwordPlana, empleado.password_hash);
    if (!passwordValida) {
      throw new NotFoundException('Credenciales incorrectas');
    }

    // 4. Retornamos los datos para armar la sesión en el cliente
  return {
      id: empleado.id,
      nombre_completo: empleado.nombre_completo,
      puesto: empleado.puesto,
      tenant_id: empleado.tenant_id,
      sucursal_id: empleado.sucursal_id,
      // ✨ NUEVO: Extraemos los nombres de las relaciones cargadas por TypeORM
      empresa_nombre: empleado.empresa ? empleado.empresa.nombre : 'Empresa Principal',
      sucursal_nombre: empleado.sucursal ? empleado.sucursal.nombre : 'Sucursal Base',
      token: `empleado-session-token-${empleado.id}`
    };
  }
}