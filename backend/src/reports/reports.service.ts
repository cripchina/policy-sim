import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {}

  async findAll(caseId?: number): Promise<Report[]> {
    const where: any = {};
    if (caseId) where.caseId = caseId;
    return this.reportsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['student', 'policyCase'],
    });
  }

  async findByStudent(studentId: number): Promise<Report[]> {
    return this.reportsRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
      relations: ['policyCase'],
    });
  }

  async findById(id: number): Promise<Report> {
    const r = await this.reportsRepository.findOne({
      where: { id },
      relations: ['student', 'policyCase'],
    });
    if (!r) throw new NotFoundException('报告不存在');
    return r;
  }

  async create(data: Partial<Report>): Promise<Report> {
    const r = this.reportsRepository.create(data);
    return this.reportsRepository.save(r);
  }

  async update(id: number, data: Partial<Report>, userId: number, userRole: string): Promise<Report> {
    const report = await this.findById(id);
    if (report.studentId !== userId && userRole === 'student') {
      throw new ForbiddenException('无权修改他人报告');
    }
    await this.reportsRepository.update(id, data);
    return this.findById(id);
  }

  async grade(id: number, score: number, comment: string): Promise<Report> {
    const report = await this.findById(id);
    report.score = score;
    report.teacherComment = comment;
    report.status = 'graded';
    return this.reportsRepository.save(report);
  }
}
