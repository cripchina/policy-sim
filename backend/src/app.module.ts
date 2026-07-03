import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CasesModule } from './cases/cases.module';
import { SimulationModule } from './simulation/simulation.module';
import { ReportsModule } from './reports/reports.module';
import { HealthModule } from './health/health.module';
import { ClassesModule } from './classes/classes.module';
import { ExperimentsModule } from './experiments/experiments.module';
import { SeedService } from './seed.service';
import { User } from './users/user.entity';
import { PolicyCase } from './cases/case.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: './data/policysim.db',
      autoSave: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, PolicyCase]),
    AuthModule,
    UsersModule,
    CasesModule,
    SimulationModule,
    ReportsModule,
    HealthModule,
    ClassesModule,
    ExperimentsModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
