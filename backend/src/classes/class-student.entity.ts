import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Class } from './class.entity';
import { User } from '../users/user.entity';

@Entity('class_students')
@Unique(['classId', 'studentId'])
export class ClassStudent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column()
  classId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  studentId: number;

  @CreateDateColumn()
  createdAt: Date;
}
