import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Class } from './class.entity';
import { ClassStudent } from './class-student.entity';
import { User, UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private classesRepository: Repository<Class>,
    @InjectRepository(ClassStudent)
    private classStudentRepository: Repository<ClassStudent>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersService: UsersService,
  ) {}

  // ============ CLASS CRUD ============

  async findAll(teacherId?: number): Promise<Class[]> {
    const where: any = {};
    if (teacherId) where.teacherId = teacherId;
    return this.classesRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['teacher'],
    });
  }

  async findById(id: number): Promise<Class> {
    const cls = await this.classesRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });
    if (!cls) throw new NotFoundException('班级不存在');
    return cls;
  }

  async create(data: { name: string; description?: string; teacherId: number }): Promise<Class> {
    const cls = this.classesRepository.create(data);
    return this.classesRepository.save(cls);
  }

  async update(id: number, data: Partial<Class>): Promise<Class> {
    await this.classesRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    // Remove all students first
    await this.classStudentRepository.delete({ classId: id });
    await this.classesRepository.delete(id);
  }

  // ============ STUDENT MANAGEMENT ============

  async getStudents(classId: number): Promise<ClassStudent[]> {
    return this.classStudentRepository.find({
      where: { classId },
      relations: ['student'],
      order: { createdAt: 'ASC' },
    });
  }

  async addStudent(classId: number, studentId: number): Promise<ClassStudent> {
    const cls = await this.findById(classId);
    const student = await this.usersRepository.findOne({ where: { id: studentId, role: UserRole.STUDENT } });
    if (!student) throw new NotFoundException('学生不存在');

    const existing = await this.classStudentRepository.findOne({
      where: { classId, studentId },
    });
    if (existing) throw new ConflictException('该学生已在班级中');

    const cs = this.classStudentRepository.create({ classId, studentId });
    return this.classStudentRepository.save(cs);
  }

  async removeStudent(classId: number, studentId: number): Promise<void> {
    const cs = await this.classStudentRepository.findOne({
      where: { classId, studentId },
    });
    if (!cs) throw new NotFoundException('该学生不在班级中');
    await this.classStudentRepository.delete(cs.id);
  }

  /**
   * Batch import students: accepts an array of { username, displayName }
   * Creates user accounts (password=123456) and enrolls them in the class.
   */
  async batchImportStudents(
    classId: number,
    students: { username: string; displayName: string }[],
  ): Promise<{ created: number; skipped: number; errors: string[] }> {
    await this.findById(classId);

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const s of students) {
      try {
        if (!s.username || !s.displayName) {
          errors.push(`学生 ${s.username || '(无用户名)'} 信息不完整`);
          continue;
        }

        let user = await this.usersService.findByUsername(s.username);
        if (user) {
          // User exists, check if already in class
          const existing = await this.classStudentRepository.findOne({
            where: { classId, studentId: user.id },
          });
          if (existing) {
            skipped++;
          } else {
            // Enroll existing student
            await this.classStudentRepository.save(
              this.classStudentRepository.create({ classId, studentId: user.id }),
            );
            created++;
          }
        } else {
          // Create new student user
          user = await this.usersService.create(s.username, '123456', s.displayName, UserRole.STUDENT);
          await this.classStudentRepository.save(
            this.classStudentRepository.create({ classId, studentId: user.id }),
          );
          created++;
        }
      } catch (e: any) {
        errors.push(`${s.username}: ${e.message || '创建失败'}`);
      }
    }

    return { created, skipped, errors };
  }
}
