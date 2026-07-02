import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SimulationRun } from './simulation-run.entity';
import { CasesService } from '../cases/cases.service';
import { SimulationEngine } from './engine';

@Injectable()
export class SimulationService {
  constructor(
    @InjectRepository(SimulationRun)
    private runsRepository: Repository<SimulationRun>,
    private casesService: CasesService,
    private engine: SimulationEngine,
  ) {}

  async run(caseId: number, userId: number, params: Record<string, number>) {
    const policyCase = await this.casesService.findById(caseId);
    const config = JSON.parse(policyCase.config);
    
    // Validate & fill defaults
    const resolvedParams: Record<string, number> = {};
    for (const p of config.parameters) {
      const val = params[p.id] ?? p.default;
      resolvedParams[p.id] = val;
    }

    // Run simulation engine
    const results = this.engine.compute(config, resolvedParams);

    // Save run
    const run = this.runsRepository.create({
      caseId,
      userId,
      parameters: JSON.stringify(resolvedParams),
      results: JSON.stringify(results),
    });
    await this.runsRepository.save(run);

    return {
      id: run.id,
      parameters: resolvedParams,
      results,
      createdAt: run.createdAt,
    };
  }

  async getHistory(userId: number, caseId?: number) {
    const where: any = { userId };
    if (caseId) where.caseId = caseId;
    const runs = await this.runsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['policyCase'],
      take: 50,
    });
    return runs.map(r => ({
      id: r.id,
      caseId: r.caseId,
      caseTitle: r.policyCase?.title || '',
      parameters: JSON.parse(r.parameters),
      results: JSON.parse(r.results),
      createdAt: r.createdAt,
    }));
  }
}
