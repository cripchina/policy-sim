import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '健康检查（无需认证）' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('db')
  @ApiOperation({ summary: '数据库诊断（无需认证）' })
  dbCheck() {
    const databaseUrl = process.env.DATABASE_URL;
    const dbType = databaseUrl ? 'postgres' : 'sqljs';
    const dbStatus = databaseUrl
      ? { type: 'postgres', configured: true, urlPrefix: databaseUrl.substring(0, databaseUrl.indexOf('://') + 3) + '***' }
      : { type: 'sqljs', configured: false };
    return {
      database: dbType,
      config: dbStatus,
      envVars: {
        hasDatabaseUrl: !!databaseUrl,
        hasNodeEnv: !!process.env.NODE_ENV,
        hasPort: !!process.env.PORT,
        nodeEnv: process.env.NODE_ENV || 'not set',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
