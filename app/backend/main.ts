import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from './common/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Retrieve our typed configuration service
  const configService = app.get(ConfigService);
  const { server, swagger } = configService;

  if (server.cors) {
    app.enableCors();
  }

  // Setup Swagger UI if enabled in the active environment
  if (swagger.enabled) {
    const config = new DocumentBuilder()
      .setTitle('OmniTransfer Backend API')
      .setDescription(`Desktop engine API connected to Rclone [Env: ${configService.env}]`)
      .setVersion('1.0')
      .addTag('Rclone Engine')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swagger.path, app, document);
  }

  await app.listen(server.port, server.host);

  console.log(`\n======================================================`);
  console.log(`🚀 OmniTransfer Backend [${configService.env.toUpperCase()}] running on: http://${server.host}:${server.port}`);
  if (swagger.enabled) {
    console.log(`📖 Interactive Swagger UI available at:        http://${server.host}:${server.port}/${swagger.path}`);
  }
  console.log(`======================================================\n`);
}

bootstrap();
