import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { PolicyCase } from '../cases/case.entity';

@Entity('simulation_runs')
export class SimulationRun {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => PolicyCase)
  @JoinColumn({ name: 'caseId' })
  policyCase: PolicyCase;

  @Column()
  caseId: number;

  /** JSON: the parameter values the user chose */
  @Column({ type: 'text' })
  parameters: string;

  /** JSON: the computed indicator results */
  @Column({ type: 'text' })
  results: string;

  @CreateDateColumn()
  createdAt: Date;
}
