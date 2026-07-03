import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('鍋ュ悍妫€鏌?)
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '鍋ュ悍妫€鏌ワ紙鏃犻渶璁よ瘉锛? })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
