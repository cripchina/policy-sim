import { Controller, Post, Get, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SimulationService } from './simulation.service';

class RunSimulationDto {
  caseId: number;
  parameters: Record<string, number>;
}

@ApiTags('仿真')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('simulation')
export class SimulationController {
  constructor(private simulationService: SimulationService) {}

  @Post('run')
  @ApiOperation({ summary: '运行仿真' })
  async run(@Body() dto: RunSimulationDto, @Request() req) {
    return this.simulationService.run(dto.caseId, req.user.id, dto.parameters);
  }

  @Get('history')
  @ApiOperation({ summary: '获取仿真历史' })
  async history(
    @Request() req,
    @Query('caseId') caseId?: string,
  ) {
    return this.simulationService.getHistory(req.user.id, caseId ? +caseId : undefined);
  }
}
