import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { PolicyCase } from '../cases/case.entity';
import { SimulationRun } from '../simulation/simulation-run.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  studentId: number;

  @ManyToOne(() => PolicyCase)
  @JoinColumn({ name: 'caseId' })
  policyCase: PolicyCase;

  @Column()
  caseId: number;

  @Column({ nullable: true })
  simulationRunId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  score: number;

  @Column({ type: 'text', nullable: true })
  teacherComment: string;

  @Column({ default: 'submitted' })
  status: string; // draft, submitted, graded

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
