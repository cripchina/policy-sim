import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve, join } from 'path';
import { existsSync } from 'fs';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // MUST be set before any other middleware
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const port = process.env.PORT || 3000;

  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('公共政策仿真平台 API')
    .setDescription('Policy Simulation Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // In production, serve the built frontend
  const frontendDistPath = resolve(__dirname, '..', '..', 'frontend', 'dist');

  if (existsSync(frontendDistPath)) {
    console.log('Serving frontend from:', frontendDistPath);

    // Serve static files (JS, CSS, images, fonts)
    // IMPORTANT: no index fallback here - we handle SPA separately
    app.useStaticAssets(frontendDistPath, {
      index: false,
      redirect: false,
    });

    // SPA fallback: for any non-API GET request, serve index.html
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET') {
        return next();
      }
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return next();
      }
      // SPA routes: any path without a file extension serves index.html
      if (!req.path.includes('.')) {
        // This is a potential SPA route - serve index.html
        res.sendFile(join(frontendDistPath, 'index.html'));
      } else {
        next();
      }
    });
  } else {
    console.log('Frontend dist not found at:', frontendDistPath);
    console.log('API-only mode. Build frontend with: cd frontend && npm run build');
  }

  await app.listen(port, '0.0.0.0');
  console.log(`Server running on http://0.0.0.0:${port}`);
}
bootstrap();
