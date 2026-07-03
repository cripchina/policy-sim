import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { PolicyCase } from '../cases/case.entity';
import { Class } from '../classes/class.entity';

export enum ExperimentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

@Entity('experiments')
export class Experiment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column()
  classId: number;

  @ManyToOne(() => PolicyCase)
  @JoinColumn({ name: 'caseId' })
  policyCase: PolicyCase;

  @Column()
  caseId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @Column()
  teacherId: number;

  @Column({ type: 'date', nullable: true })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  @Column({
    type: 'simple-enum',
    enum: ExperimentStatus,
    default: ExperimentStatus.PENDING,
  })
  status: ExperimentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
