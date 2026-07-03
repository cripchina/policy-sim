import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ExperimentsService } from './experiments.service';
import { Experiment } from './experiment.entity';

class CreateExperimentDto {
  title: string;
  description?: string;
  classId: number;
  caseId: number;
  startDate?: string;
  endDate?: string;
}

@ApiTags('实验管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('experiments')
export class ExperimentsController {
  constructor(private experimentsService: ExperimentsService) {}

  @Get()
  @ApiOperation({ summary: '获取实验列表' })
  async findAll(@Request() req): Promise<Experiment[]> {
    if (req.user.role === 'admin') {
      return this.experimentsService.findAll();
    }
    return this.experimentsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取实验详情' })
  async findOne(@Param('id') id: string): Promise<Experiment> {
    return this.experimentsService.findById(+id);
  }

  @Post()
  @ApiOperation({ summary: '创建实验' })
  async create(@Body() dto: CreateExperimentDto, @Request() req): Promise<Experiment> {
    return this.experimentsService.create({
      title: dto.title,
      description: dto.description,
      classId: dto.classId,
      caseId: dto.caseId,
      teacherId: req.user.id,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: '更新实验' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateExperimentDto>): Promise<Experiment> {
    return this.experimentsService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除实验' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.experimentsService.delete(+id);
  }

  @Get(':id/results')
  @ApiOperation({ summary: '获取实验结果（全班学生提交情况）' })
  async getResults(@Param('id') id: string) {
    return this.experimentsService.getResults(+id);
  }
}
