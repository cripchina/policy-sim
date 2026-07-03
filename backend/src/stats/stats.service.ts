import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassStudent } from '../classes/class-student.entity';
import { Class } from '../classes/class.entity';
import { Experiment } from '../experiments/experiment.entity';
import { SimulationRun } from '../simulation/simulation-run.entity';
import { Report } from '../reports/report.entity';
import { PolicyCase } from '../cases/case.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(ClassStudent)
    private classStudentRepo: Repository<ClassStudent>,
    @InjectRepository(Class)
    private classRepo: Repository<Class>,
    @InjectRepository(Experiment)
    private experimentRepo: Repository<Experiment>,
    @InjectRepository(SimulationRun)
    private simRunRepo: Repository<SimulationRun>,
    @InjectRepository(Report)
    private reportRepo: Repository<Report>,
    @InjectRepository(PolicyCase)
    private caseRepo: Repository<PolicyCase>,
  ) {}

  async getStudentStats(userId: number) {
    // Get classes the student belongs to
    const myClassEnrollments = await this.classStudentRepo.find({
      where: { studentId: userId },
      relations: ['class'],
    });
    const classIds = myClassEnrollments.map((e) => e.classId);

    // Get experiments assigned to those classes
    let assignedExperiments: Experiment[] = [];
    if (classIds.length > 0) {
      assignedExperiments = await this.experimentRepo.find({
        where: classIds.map((cid) => ({ classId: cid })),
        relations: ['class', 'policyCase', 'teacher'],
        order: { createdAt: 'DESC' },
      });
    }

    // Get simulation runs by this student
    const simRuns = await this.simRunRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['policyCase'],
    });

    // Count distinct cases simulated
    const simulatedCaseIds = new Set(simRuns.map((r) => r.caseId));

    // Get reports by this student
    const reports = await this.reportRepo.find({
      where: { studentId: userId },
      order: { createdAt: 'DESC' },
      relations: ['policyCase'],
    });

    const totalCases = await this.caseRepo.count();
    const totalSims = simRuns.length;
    const totalReports = reports.length;
    const gradedReports = reports.filter((r) => r.score != null).length;
    const pendingReports = reports.filter((r) => r.score == null).length;

    return {
      totalCases,
      totalSims,
      totalReports,
      gradedReports,
      pendingReports,
      totalClasses: classIds.length,
      totalExperiments: assignedExperiments.length,
      simulatedCases: simulatedCaseIds.size,
      myClasses: myClassEnrollments.map((e) => ({
        id: e.class.id,
        name: e.class.name,
      })),
      recentExperiments: assignedExperiments.slice(0, 5).map((e) => ({
        id: e.id,
        title: e.title,
        status: e.status,
        caseTitle: e.policyCase?.title || '',
        className: e.class?.name || '',
        teacherName: e.teacher?.displayName || '',
        startDate: e.startDate,
        endDate: e.endDate,
      })),
      recentSims: simRuns.slice(0, 5).map((r) => ({
        id: r.id,
        caseId: r.caseId,
        caseTitle: r.policyCase?.title || '',
        createdAt: r.createdAt,
        results: r.results,
      })),
      recentReports: reports.slice(0, 5).map((r) => ({
        id: r.id,
        caseId: r.caseId,
        caseTitle: r.policyCase?.title || '',
        score: r.score,
        status: r.status,
        createdAt: r.createdAt,
      })),
    };
  }

  async getTeacherStats(userId: number) {
    const where = { teacherId: userId };

    // Classes
    const classes = await this.classRepo.find({ where, order: { createdAt: 'DESC' } });
    const classIds = classes.map((c) => c.id);

    // Student counts per class
    const studentCounts: Record<number, number> = {};
    for (const cid of classIds) {
      studentCounts[cid] = await this.classStudentRepo.count({ where: { classId: cid } });
    }

    // Experiments
    const experiments = await this.experimentRepo.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['class', 'policyCase'],
    });
    const experimentIds = experiments.map((e) => e.id);

    // Reports submitted for teacher's experiments (by case)
    const caseIds = experiments.map((e) => e.caseId);
    let totalSubmissions = 0;
    if (caseIds.length > 0) {
      totalSubmissions = await this.simRunRepo.count({
        where: caseIds.map((cid) => ({ caseId: cid })),
      });
    }

    // Total reports received
    let totalReports = 0;
    if (classIds.length > 0) {
      // Reports from students in teacher's classes
      const allStudents = await this.classStudentRepo.find({
        where: classIds.map((cid) => ({ classId: cid })),
      });
      const studentIds = [...new Set(allStudents.map((s) => s.studentId))];
      if (studentIds.length > 0) {
        totalReports = await this.reportRepo.count({
          where: studentIds.map((sid) => ({ studentId: sid })),
        });
      }
    }

    return {
      totalClasses: classes.length,
      totalStudents: Object.values(studentCounts).reduce((a, b) => a + b, 0),
      totalExperiments: experiments.length,
      totalSubmissions,
      totalReports,
      classList: classes.map((c) => ({
        id: c.id,
        name: c.name,
        studentCount: studentCounts[c.id] || 0,
        createdAt: c.createdAt,
      })),
      recentExperiments: experiments.slice(0, 5).map((e) => ({
        id: e.id,
        title: e.title,
        status: e.status,
        className: e.class?.name || '',
        caseTitle: e.policyCase?.title || '',
        startDate: e.startDate,
        endDate: e.endDate,
      })),
    };
  }
}
