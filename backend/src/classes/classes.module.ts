import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './class.entity';
import { ClassStudent } from './class-student.entity';
import { User } from '../users/user.entity';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Class, ClassStudent, User]),
    UsersModule,
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
