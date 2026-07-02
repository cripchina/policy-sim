import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cases')
export class PolicyCase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 100 })
  category: string;

  @Column({ length: 500, nullable: true })
  coverImage: string;

  @Column({ type: 'text' })
  background: string;

  /**
   * JSON config defining:
   * - parameters: input controls for the simulation
   * - indicators: output metrics
   * - formulas: how parameters map to indicators
   */
  @Column({ type: 'text' })
  config: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
