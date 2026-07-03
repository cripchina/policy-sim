import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { StatsService } from './stats.service';

@ApiTags('统计')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('stats')
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('student')
  @ApiOperation({ summary: '学生端统计数据' })
  async getStudentStats(@Request() req) {
    return this.statsService.getStudentStats(req.user.id);
  }

  @Get('teacher')
  @ApiOperation({ summary: '教师端统计数据' })
  async getTeacherStats(@Request() req) {
    return this.statsService.getTeacherStats(req.user.id);
  }
}
