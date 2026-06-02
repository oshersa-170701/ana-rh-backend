import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
// 1. ✨ IMPORTACIÓN CORREGIDA: Traemos la Entidad y los dos Enums necesarios
import { Asistencia, TipoEvento, MetodoValidacion } from './entities/asistencia.entity';
import { randomUUID } from 'crypto';

import { CheckAsistenciaDto } from './dto/check-asistencia.dto';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { Incidencia } from 'src/incidencias/entities/incidencia.entity';

@Injectable()
export class AsistenciasService {
  constructor(
    @InjectRepository(Asistencia)
    private readonly asistenciaRepository: Repository<Asistencia>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    @InjectRepository(Incidencia) // 🔥 INYECCIÓN DE ORO
    private readonly incidenciaRepository: Repository<Incidencia>,
  ) { }

  async registrarChecadaAutomatica(checkDto: CheckAsistenciaDto) {
    const { empleado_id, score_confianza_ia } = checkDto;

    // 1. Verificamos que el empleado exista y esté activo
    const empleado = await this.empleadoRepository.findOneBy({ id: empleado_id });
    if (!empleado) {
      throw new NotFoundException(`El colaborador no está registrado en el sistema`);
    }
    if (empleado.estatus === false) {
      throw new BadRequestException(`El colaborador se encuentra Inactivo en el sistema`);
    }

    // 2. Calculamos Fecha y Hora actual del servidor local
    const ahora = new Date();
    const fechaHoy = ahora.toISOString().split('T')[0];
    const horaActual = ahora.toTimeString().split(' ')[0];

    // 3. Consultamos cuántas asistencias lleva este empleado el día de hoy
    const asistenciasHoy = await this.asistenciaRepository.find({
      where: { empleado_id, fecha: fechaHoy },
      order: { created_at: 'ASC' }
    });

    const cantidadChecadas = asistenciasHoy.length;
    let siguienteEvento: TipoEvento;

    // 4. Inteligencia de Estados
    switch (cantidadChecadas) {
      case 0:
        siguienteEvento = TipoEvento.ENTRADA;
        break;
      case 1:
        siguienteEvento = TipoEvento.INICIO_ALMUERZO;
        break;
      case 2:
        siguienteEvento = TipoEvento.FIN_ALMUERZO;
        break;
      case 3:
        siguienteEvento = TipoEvento.SALIDA;
        break;
      default:
        throw new BadRequestException(`El colaborador ya completó todas sus asistencias establecidas para el día de hoy.`);
    }

    // 5. ✨ CORRECCIÓN DE OVERLOAD: Cambiamos '|| null' por el operador '?? undefined' 
    // para cumplir de forma estricta con el tipo DeepPartial de TypeORM
    const nuevaAsistencia = this.asistenciaRepository.create({
      id: randomUUID(),
      tenant_id: empleado.tenant_id!,
      empleado_id: empleado.id,
      fecha: fechaHoy,
      tipo_evento: siguienteEvento,
      hora: horaActual,
      metodo_validacion: MetodoValidacion.FACIAL,
      score_confianza_ia: score_confianza_ia ?? undefined
    });

    const guardado = await this.asistenciaRepository.save(nuevaAsistencia);

    return {
      success: true,
      evento: siguienteEvento,
      hora: horaActual,
      nombre_empleado: empleado.nombre_completo,
      puesto: empleado.puesto,
      mensaje: this.obtenerMensajePersonalizado(siguienteEvento, empleado.nombre_completo)
    };
  }

  private obtenerMensajePersonalizado(evento: TipoEvento, nombre: string): string {
    const primerNombre = nombre.split(' ')[0];
    switch (evento) {
      case TipoEvento.ENTRADA: return `¡Excelente jornada laboral, bienvenido ${primerNombre}! 👋`;
      case TipoEvento.INICIO_ALMUERZO: return `¡Buen provecho ${primerNombre}, disfruta tu almuerzo! 🍔`;
      case TipoEvento.FIN_ALMUERZO: return `¡Bienvenido de vuelta ${primerNombre}, éxito en el cierre de turno! ✨`;
      case TipoEvento.SALIDA: return `¡Excelente trabajo hoy ${primerNombre}, que tengas un feliz descanso! 🏠`;
      default: return `Registro procesado correctamente.`;
    }
  }

  async create(createAsistenciaDto: CreateAsistenciaDto) {
    const nuevaAsistencia = this.asistenciaRepository.create({
      id: randomUUID(),
      ...createAsistenciaDto,
    });
    return await this.asistenciaRepository.save(nuevaAsistencia);
  }

  async findAll() {
    return await this.asistenciaRepository.find();
  }

  async findOne(id: string) {
    const asistencia = await this.asistenciaRepository.findOneBy({ id });
    if (!asistencia) {
      throw new NotFoundException(`La asistencia con ID ${id} no fue encontrada`);
    }
    return asistencia;
  }

  async update(id: string, updateAsistenciaDto: UpdateAsistenciaDto) {
    const asistencia = await this.findOne(id);
    Object.assign(asistencia, updateAsistenciaDto);
    return await this.asistenciaRepository.save(asistencia);
  }

  async remove(id: string) {
    const asistencia = await this.findOne(id);
    return await this.asistenciaRepository.remove(asistencia);
  }
async findBySucursal(tenant_id: string, sucursal_id: string) {
    // 1. Traemos las asistencias ordinarias de la sucursal
    const asistencias = await this.asistenciaRepository.find({
      where: {
        tenant_id,
        empleado: { sucursal_id } 
      },
      relations: {
        empleado: true 
      },
      order: {
        fecha: 'DESC',
        hora: 'DESC'
      }
    });

    // 🚀 2. ASIGNACIÓN REFORZADA CON ACUMULADOR DE HORAS EXTRA
    const asistenciasConIncidencias = await Promise.all(
      asistencias.map(async (asistencia) => {
        const incidenciasDelDia = await this.incidenciaRepository.find({
          where: {
            empleado_id: asistencia.empleado_id,
            fecha: asistencia.fecha
          },
          relations: {
            aprobador: true
          }
        });

        if (incidenciasDelDia.length === 0) {
          return { ...asistencia, incidencia: null };
        }

        let incidenciaAsignada: any = null;

        // 🧠 DISTRIBUCIÓN POR EVENTO LÓGICO CON FUSIÓN DE DATOS
        if (asistencia.tipo_evento === TipoEvento.ENTRADA) {
          incidenciaAsignada = incidenciasDelDia.find(i => i.tipo === 'FALTA' || i.tipo === 'RETARDO');
        } 
        else if (asistencia.tipo_evento === TipoEvento.INICIO_ALMUERZO) {
          incidenciaAsignada = incidenciasDelDia.find(i => i.tipo === 'PERMISO' || i.tipo === 'VACACIONES');
        } 
        else if (asistencia.tipo_evento === TipoEvento.SALIDA) {
          // 🔥 BLOQUE DE FUSIÓN: Filtramos TODAS las horas extra de este empleado hoy
          const horasExtraDelDia = incidenciasDelDia.filter(i => i.tipo === 'HORA_EXTRA');

          if (horasExtraDelDia.length > 0) {
            // Sumamos las cantidades de horas de forma limpia (casteando a Number por el tipo decimal)
            const totalHoras = horasExtraDelDia.reduce((sum, i) => sum + Number(i.cantidad_horas), 0);
            
            // Unimos las justificaciones de cada bloque para que no se pierda nada en la auditoría
            const motivosUnidos = horasExtraDelDia.map((i, index) => `[Bloque ${index + 1}]: ${i.motivo}`).join(' | ');

            // Estructuramos un único objeto combinado que mantenga los datos del aprobador
            incidenciaAsignada = {
              ...horasExtraDelDia[0], // Copia la estructura base (id, tipo, fecha, etc.)
              cantidad_horas: totalHoras, // ⏱️ Horas acumuladas totales
              motivo: motivosUnidos, // 📝 Justificaciones fusionadas
            };
          }
        }

        return {
          ...asistencia,
          incidencia: incidenciaAsignada || null
        };
      })
    );

    return asistenciasConIncidencias;
  }
}