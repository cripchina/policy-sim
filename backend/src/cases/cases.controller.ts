import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CasesService } from './cases.service';
import { PolicyCase } from './case.entity';

@ApiTags('案例')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('cases')
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Get()
  @ApiOperation({ summary: '获取所有案例' })
  async findAll(): Promise<PolicyCase[]> {
    return this.casesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个案例详情' })
  async findOne(@Param('id') id: string): Promise<PolicyCase> {
    return this.casesService.findById(+id);
  }

  @Post()
  @ApiOperation({ summary: '创建新案例' })
  async create(@Body() data: Partial<PolicyCase>): Promise<PolicyCase> {
    return this.casesService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新案例' })
  async update(@Param('id') id: string, @Body() data: Partial<PolicyCase>): Promise<PolicyCase> {
    return this.casesService.update(+id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除案例' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.casesService.delete(+id);
  }
}
