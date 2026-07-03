import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { ClassStudent } from '../classes/class-student.entity';
import { Class } from '../classes/class.entity';
import { Experiment } from '../experiments/experiment.entity';
import { SimulationRun } from '../simulation/simulation-run.entity';
import { Report } from '../reports/report.entity';
import { PolicyCase } from '../cases/case.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassStudent, Class, Experiment, SimulationRun, Report, PolicyCase]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
