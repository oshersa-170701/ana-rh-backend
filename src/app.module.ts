import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmpresasModule } from './empresas/empresas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { AsistenciasModule } from './asistencias/asistencias.module';
import { IncidenciasModule } from './incidencias/incidencias.module';
import { NominasModule } from './nominas/nominas.module';

// 🔥 IMPORTACIONES CRUCIALES PARA ROMPER EL CICLO DE METADATOS
import { Nomina } from './nominas/entities/nomina.entity';
import { NominaDetalle } from './nomina-detalle/entities/nomina-detalle.entity';


@Module({
  imports: [
    // 1. Inicializamos las variables de entorno para que estén disponibles en todo el proyecto
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Configuramos la conexión a MySQL usando TypeORM
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      
      // ✨ PARCHE DE ACERO: Forzamos el registro manual de las entidades vinculadas
      entities: [Nomina, NominaDetalle], 
      
      autoLoadEntities: true, // Sigue cargando automáticamente las demás (Asistencia, Empleado, etc.)
      synchronize: false, // ¡Muy importante en false! Porque ya creamos nuestras tablas con el script SQL
    }),

    EmpresasModule,

    UsuariosModule,

    SucursalesModule,

    EmpleadosModule,

    AsistenciasModule,

    IncidenciasModule,

    NominasModule, // 🧠 Ahora cuando entre aquí, ya conocerá los metadatos de ambos de antemano
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}