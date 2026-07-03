import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ClassesService } from './classes.service';
import { Class } from './class.entity';
import { ClassStudent } from './class-student.entity';
import { UserRole } from '../users/user.entity';

class CreateClassDto {
  name: string;
  description?: string;
}

class BatchImportDto {
  students: { username: string; displayName: string }[];
}

@ApiTags('班级管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('classes')
export class ClassesController {
  constructor(private classesService: ClassesService) {}

  @Get()
  @ApiOperation({ summary: '获取班级列表（教师看自己的，管理员看全部）' })
  async findAll(@Request() req): Promise<Class[]> {
    if (req.user.role === 'admin') {
      return this.classesService.findAll();
    }
    return this.classesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取班级详情' })
  async findOne(@Param('id') id: string): Promise<Class> {
    return this.classesService.findById(+id);
  }

  @Post()
  @ApiOperation({ summary: '创建班级' })
  async create(@Body() dto: CreateClassDto, @Request() req): Promise<Class> {
    return this.classesService.create({
      name: dto.name,
      description: dto.description,
      teacherId: req.user.id,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: '更新班级信息' })
  async update(@Param('id') id: string, @Body() dto: CreateClassDto): Promise<Class> {
    return this.classesService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除班级' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.classesService.delete(+id);
  }

  // ============ STUDENT MANAGEMENT ============

  @Get(':id/students')
  @ApiOperation({ summary: '获取班级学生列表' })
  async getStudents(@Param('id') id: string): Promise<ClassStudent[]> {
    return this.classesService.getStudents(+id);
  }

  @Post(':id/students')
  @ApiOperation({ summary: '添加单个学生到班级' })
  async addStudent(@Param('id') id: string, @Body() dto: { studentId: number }): Promise<ClassStudent> {
    return this.classesService.addStudent(+id, dto.studentId);
  }

  @Delete(':id/students/:studentId')
  @ApiOperation({ summary: '从班级移除学生' })
  async removeStudent(@Param('id') id: string, @Param('studentId') studentId: string): Promise<void> {
    return this.classesService.removeStudent(+id, +studentId);
  }

  @Post(':id/students/batch')
  @ApiOperation({ summary: '批量导入学生（自动创建账号，默认密码123456）' })
  async batchImport(
    @Param('id') id: string,
    @Body() dto: BatchImportDto,
  ) {
    return this.classesService.batchImportStudents(+id, dto.students);
  }
}
