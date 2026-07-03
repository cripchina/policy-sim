import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experiment, ExperimentStatus } from './experiment.entity';
import { SimulationRun } from '../simulation/simulation-run.entity';

@Injectable()
export class ExperimentsService {
  constructor(
    @InjectRepository(Experiment)
    private experimentsRepository: Repository<Experiment>,
    @InjectRepository(SimulationRun)
    private simulationRunRepository: Repository<SimulationRun>,
  ) {}

  async findAll(teacherId?: number): Promise<Experiment[]> {
    const where: any = {};
    if (teacherId) where.teacherId = teacherId;
    return this.experimentsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['class', 'policyCase', 'teacher'],
    });
  }

  async findById(id: number): Promise<Experiment> {
    const exp = await this.experimentsRepository.findOne({
      where: { id },
      relations: ['class', 'policyCase', 'teacher', 'class.teacher'],
    });
    if (!exp) throw new NotFoundException('实验不存在');
    return exp;
  }

  async create(data: Partial<Experiment>): Promise<Experiment> {
    const exp = this.experimentsRepository.create(data);
    return this.experimentsRepository.save(exp);
  }

  async update(id: number, data: Partial<Experiment>): Promise<Experiment> {
    await this.experimentsRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.experimentsRepository.delete(id);
  }

  /**
   * Get simulation results for all students in this experiment.
   * Returns the latest simulation run per student for the experiment's case.
   */
  async getResults(experimentId: number): Promise<any[]> {
    const exp = await this.findById(experimentId);

    // Get all latest simulation runs from students in this class
    const results = await this.simulationRunRepository
      .createQueryBuilder('run')
      .innerJoinAndSelect('run.user', 'user')
      .innerJoin('class_students', 'cs', 'cs.studentId = run.userId')
      .where('cs.classId = :classId', { classId: exp.classId })
      .andWhere('run.caseId = :caseId', { caseId: exp.caseId })
      .orderBy('run.createdAt', 'DESC')
      .getMany();

    // Deduplicate: keep only latest run per student
    const latestPerStudent = new Map<number, any>();
    for (const run of results) {
      if (!latestPerStudent.has(run.userId)) {
        latestPerStudent.set(run.userId, run);
      }
    }

    return Array.from(latestPerStudent.values()).map((run) => ({
      studentId: run.userId,
      studentName: run.user.displayName,
      runId: run.id,
      parameters: run.parameters,
      indicators: run.indicators,
      submittedAt: run.createdAt,
    }));
  }
}
