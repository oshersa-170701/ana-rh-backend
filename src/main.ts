import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
// ✨ IMPORTACIÓN NECESARIA PARA EL TIPO EXPRESS
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express'; // 👈 1. Importamos express si no lo tenías
async function bootstrap() {
  // ✨ INICIALIZACIÓN ÚNICA: Usamos el tipo correcto desde el principio
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // 🚀 2. AMPLIAR LÍMITE DE PAYLOAD: Configuramos el middleware interno de Express
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  // Servir archivos estáticos desde la carpeta 'uploads'
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // ¡Activamos el escudo de validaciones global!
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      }
    }),
  );

  // HABILITAMOS CORS 
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.listen(3000);
  console.log('Servidor corriendo en http://localhost:3000 🚀');
}
bootstrap();