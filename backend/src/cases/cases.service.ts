import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyCase } from './case.entity';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(PolicyCase)
    private casesRepository: Repository<PolicyCase>,
  ) {}

  async findAll(): Promise<PolicyCase[]> {
    return this.casesRepository.find({ where: { isActive: true }, order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<PolicyCase> {
    const c = await this.casesRepository.findOne({ where: { id } });
    if (!c) throw new NotFoundException('案例不存在');
    return c;
  }

  async create(data: Partial<PolicyCase>): Promise<PolicyCase> {
    const c = this.casesRepository.create(data);
    return this.casesRepository.save(c);
  }

  async update(id: number, data: Partial<PolicyCase>): Promise<PolicyCase> {
    await this.casesRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.casesRepository.delete(id);
  }
}
