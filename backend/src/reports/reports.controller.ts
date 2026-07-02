import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { Report } from './report.entity';

@ApiTags('报告')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: '获取所有报告(教师)/我的报告(学生)' })
  async findAll(@Request() req, @Query('caseId') caseId?: string) {
    if (req.user.role === 'student') {
      return this.reportsService.findByStudent(req.user.id);
    }
    return this.reportsService.findAll(caseId ? +caseId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取报告详情' })
  async findOne(@Param('id') id: string): Promise<Report> {
    return this.reportsService.findById(+id);
  }

  @Post()
  @ApiOperation({ summary: '创建报告' })
  async create(@Body() data: Partial<Report>, @Request() req): Promise<Report> {
    return this.reportsService.create({ ...data, studentId: req.user.id });
  }

  @Put(':id')
  @ApiOperation({ summary: '更新报告(草稿/重新提交)' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Report>,
    @Request() req,
  ): Promise<Report> {
    return this.reportsService.update(+id, data, req.user.id, req.user.role);
  }

  @Put(':id/grade')
  @ApiOperation({ summary: '教师评分' })
  async grade(
    @Param('id') id: string,
    @Body() dto: { score: number; comment: string },
  ): Promise<Report> {
    return this.reportsService.grade(+id, dto.score, dto.comment);
  }
}
