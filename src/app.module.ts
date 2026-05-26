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
      autoLoadEntities: true, // Esto cargará nuestras entidades automáticamente después
      synchronize: false, // ¡Muy importante en false! Porque ya creamos nuestras tablas con el script SQL
    }),

    EmpresasModule,

    UsuariosModule,

    SucursalesModule,

    EmpleadosModule,

    AsistenciasModule,

    IncidenciasModule,

    NominasModule,

  
    EmpleadosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
