import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimulationRun } from './simulation-run.entity';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';
import { SimulationEngine } from './engine';
import { CasesModule } from '../cases/cases.module';

@Module({
  imports: [TypeOrmModule.forFeature([SimulationRun]), CasesModule],
  controllers: [SimulationController],
  providers: [SimulationService, SimulationEngine],
  exports: [SimulationService, SimulationEngine],
})
export class SimulationModule {}
