import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './users/user.entity';
import { PolicyCase } from './cases/case.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(PolicyCase)
    private caseRepo: Repository<PolicyCase>,
  ) {}

  async onModuleInit() {
    const userCount = await this.userRepo.count();
    const caseCount = await this.caseRepo.count();
    const caseCheck = await this.caseRepo.findOne({ where: { title: "\u7a0e\u6536\u653f\u7b56\u5bf9\u5b8f\u89c2\u7ecf\u6d4e\u7684\u5f71\u54cd" } });
    if (caseCheck) {
      console.log("Database already has valid seed data, skipping seed");
      return;
    }
    if (caseCount > 0) {
      console.log("Detected garbled/unexpected case data, re-seeding cases...");
      await this.caseRepo.clear();
    }
    if (userCount > 0) {
      console.log("Users exist, will seed cases only");
      const cases = this.buildCases();
      await this.caseRepo.save(cases);
      console.log("Cases seeded successfully!");
      return;
    }
    console.log("Seeding database...");
    const hashedPwd = await bcrypt.hash('123456', 10);

    await this.userRepo.save([
      { username: "admin", password: hashedPwd, displayName: "\u7cfb\u7edf\u7ba1\u7406\u5458", role: UserRole.ADMIN },
      { username: "teacher1", password: hashedPwd, displayName: "\u5f20\u8001\u5e08", role: UserRole.TEACHER },
      { username: "teacher2", password: hashedPwd, displayName: "\u738b\u8001\u5e08", role: UserRole.TEACHER },
      { username: "student1", password: hashedPwd, displayName: "\u674e\u540c\u5b66", role: UserRole.STUDENT },
      { username: "student2", password: hashedPwd, displayName: "\u8d75\u540c\u5b66", role: UserRole.STUDENT },
      { username: "student3", password: hashedPwd, displayName: "\u9648\u540c\u5b66", role: UserRole.STUDENT },
    ]);

    const cases = this.buildCases();
    await this.caseRepo.save(cases);
    console.log("Seed completed successfully!");
  }

  private buildCases(): Partial<PolicyCase>[] {
    return [
      { title: "\u7a0e\u6536\u653f\u7b56\u5bf9\u5b8f\u89c2\u7ecf\u6d4e\u7684\u5f71\u54cd", description: "\u6a21\u62df\u589e\u503c\u7a0e\u7387\u3001\u4f01\u4e1a\u6240\u5f97\u7a0e\u7387\u7b49\u7a0e\u6536\u5de5\u5177\uff0c\u89c2\u5bdf\u5bf9GDP\u3001\u4f01\u4e1a\u6295\u8d44\u3001\u5c31\u4e1a\u7b49\u5b8f\u89c2\u7ecf\u6d4e\u6307\u6807\u7684\u5f71\u54cd\u3002", category: "\u8d22\u653f\u7a0e\u6536", background: "## \u653f\u7b56\u80cc\u666f\n\n\u7a0e\u6536\u653f\u7b56\u662f\u56fd\u5bb6\u5b8f\u89c2\u8c03\u63a7\u7684\u91cd\u8981\u5de5\u5177\u3002\u5f53\u524d\u6211\u56fd\u7ecf\u6d4e\u9762\u4e34\u4e0b\u884c\u538b\u529b\uff0c\u5982\u4f55\u901a\u8fc7\u7a0e\u6536\u653f\u7b56\u7684\u8c03\u6574\u5b9e\u73b0\u201c\u51cf\u7a0e\u964d\u8d39\u3001\u4f18\u5316\u7ed3\u6784\u201d\u6210\u4e3a\u5f53\u524d\u9762\u4e34\u7684\u5173\u952e\u95ee\u9898\u3002\n\n## \u5b9e\u9a8c\u76ee\u6807\n\n\u901a\u8fc7\u8c03\u6574\u4e0d\u540c\u7684\u7a0e\u6536\u5de5\u5177\u53c2\u6570\uff0c\u89c2\u5bdf\u5404\u9879\u5b8f\u89c2\u7ecf\u6d4e\u6307\u6807\u7684\u53d8\u5316\u8d8b\u52bf\uff0c\u7406\u89e3\u7a0e\u6536\u653f\u7b56\u5bf9\u7ecf\u6d4e\u8fd0\u884c\u7684\u5f71\u54cd\u673a\u5236\u3002", config: JSON.stringify(this.taxPolicyCase()), },
      { title: "\u73af\u5883\u4fdd\u62a4\u4e0e\u7ecf\u6d4e\u53d1\u5c55\u7684\u5e73\u8861", description: "\u63a2\u7d22\u6392\u653e\u6807\u51c6\u3001\u6c61\u67d3\u7a0e\u3001\u7eff\u8272\u8865\u8d34\u7b49\u73af\u5883\u653f\u7b56\u5de5\u5177\uff0c\u5982\u4f55\u5728\u6539\u5584\u73af\u5883\u8d28\u91cf\u7684\u540c\u65f6\u4fc3\u8fdb\u4f01\u4e1a\u8f6c\u578b\u548c\u5c31\u4e1a\u3002", category: "\u73af\u5883\u653f\u7b56", background: "## \u653f\u7b56\u80cc\u666f\n\n\u7ecf\u6d4e\u53d1\u5c55\u4e0e\u73af\u5883\u4fdd\u62a4\u4e4b\u95f4\u7684\u5e73\u8861\u662f\u53ef\u6301\u7eed\u53d1\u5c55\u7684\u6838\u5fc3\u6311\u6218\u3002\u5982\u4f55\u5728\u4fdd\u6301\u7ecf\u6d4e\u589e\u957f\u7684\u540c\u65f6\u6539\u5584\u73af\u5883\u8d28\u91cf\uff0c\u662f\u5404\u56fd\u653f\u5e9c\u9762\u4e34\u7684\u91cd\u8981\u653f\u7b56\u95ee\u9898\u3002", config: JSON.stringify(this.environmentCase()), },
      { title: "\u793e\u4f1a\u4fdd\u969c\u652f\u51fa\u4e0e\u793e\u4f1a\u7a33\u5b9a", description: "\u8c03\u6574\u793e\u4f1a\u4fdd\u969c\u652f\u51fa\u3001\u6700\u4f4e\u5de5\u8d44\u3001\u5931\u4e1a\u6551\u6d4e\u91d1\u548c\u533b\u7597\u4fdd\u969c\u8986\u76d6\u7387\uff0c\u8bc4\u4f30\u5bf9\u8d2b\u56f0\u7387\u3001\u793e\u4f1a\u7a33\u5b9a\u548c\u8d22\u653f\u53ef\u6301\u7eed\u6027\u7684\u7efc\u5408\u5f71\u54cd\u3002", category: "\u793e\u4f1a\u4fdd\u969c", background: "## \u653f\u7b56\u80cc\u666f\n\n\u5b8c\u5584\u7684\u793e\u4f1a\u4fdd\u969c\u4f53\u7cfb\u662f\u4eba\u6c11\u751f\u6d3b\u7684\u91cd\u8981\u4fdd\u969c\u3002\u5728\u4eba\u53e3\u8001\u9f84\u5316\u52a0\u901f\u7684\u80cc\u666f\u4e0b\uff0c\u5982\u4f55\u5e73\u8861\u4fdd\u969c\u6c34\u5e73\u4e0e\u8d22\u653f\u53ef\u6301\u7eed\u6027\u6210\u4e3a\u653f\u7b56\u5236\u5b9a\u8005\u5fc5\u987b\u9762\u5bf9\u7684\u5173\u952e\u6311\u6218\u3002", config: JSON.stringify(this.welfareCase()), },
      { title: "\u623f\u5730\u4ea7\u8c03\u63a7\u4e0e\u5e02\u573a\u7a33\u5b9a", description: "\u8fd0\u7528\u623f\u4ea7\u7a0e\u3001\u571f\u5730\u4f9b\u5e94\u3001\u8d37\u6b3e\u5229\u7387\u548c\u9650\u8d2d\u653f\u7b56\u7b49\u5de5\u5177\uff0c\u5b9e\u73b0\u201c\u4f4f\u6709\u6240\u5c45\u201d\u76ee\u6807\uff0c\u4fc3\u8fdb\u623f\u5730\u4ea7\u5e02\u573a\u5065\u5eb7\u53d1\u5c55\u3002", category: "\u4f4f\u623f\u653f\u7b56", background: "## \u653f\u7b56\u80cc\u666f\n\n\u623f\u5730\u4ea7\u5e02\u573a\u7684\u5e73\u7a33\u5065\u5eb7\u53d1\u5c55\u5173\u7cfb\u7ecf\u6d4e\u5168\u5c40\u548c\u4eba\u6c11\u7fa4\u4f17\u7684\u5207\u8eab\u5229\u76ca\u3002\u5982\u4f55\u901a\u8fc7\u653f\u7b56\u5de5\u5177\u7ec4\u5408\u5b9e\u73b0\u201c\u623f\u4f4f\u4e0d\u7092\u201d\u7684\u76ee\u6807\uff0c\u662f\u672c\u5b9e\u9a8c\u63a2\u8ba8\u7684\u91cd\u70b9\u3002", config: JSON.stringify(this.housingCase()), },
      { title: "\u79d1\u6280\u521b\u65b0\u9a71\u52a8\u4ea7\u4e1a\u5347\u7ea7", description: "\u901a\u8fc7\u7814\u53d1\u8865\u8d34\u3001\u77e5\u8bc6\u4ea7\u6743\u4fdd\u62a4\u3001\u6559\u80b2\u6295\u8d44\u548c\u4eba\u624d\u5438\u5f15\u653f\u7b56\uff0c\u63a8\u52a8\u79d1\u6280\u521b\u65b0\u548c\u4ea7\u4e1a\u7ed3\u6784\u5347\u7ea7\u3002", category: "\u79d1\u6280\u653f\u7b56", background: "## \u653f\u7b56\u80cc\u666f\n\n\u79d1\u6280\u521b\u65b0\u662f\u5f15\u9886\u53d1\u5c55\u7684\u7b2c\u4e00\u52a8\u529b\u3002\u5728\u5f53\u524d\u5168\u7403\u7ecf\u6d4e\u7ade\u4e89\u52a0\u5267\u7684\u80cc\u666f\u4e0b\uff0c\u5982\u4f55\u901a\u8fc7\u653f\u7b56\u7ec4\u5408\u62f3\u63d0\u5347\u56fd\u5bb6\u521b\u65b0\u80fd\u529b\uff0c\u63a8\u52a8\u4ea7\u4e1a\u5411\u4ef7\u503c\u94fe\u9ad8\u7aef\u6500\u5347\uff0c\u662f\u653f\u7b56\u5236\u5b9a\u8005\u5173\u6ce8\u7684\u6838\u5fc3\u8bae\u9898\u3002", config: JSON.stringify(this.innovationCase()), },
      { title: "HeroPro \u5e94\u6025\u707e\u5bb3\u54cd\u5e94", description: "\u6a21\u62df\u81ea\u7136\u707e\u5bb3\u5e94\u6025\u54cd\u5e94\u4e2d\u7684\u8d44\u6e90\u8c03\u5ea6\u3001\u4eba\u5458\u758f\u6563\u548c\u5371\u673a\u6c9f\u901a\u7b56\u7565\uff0c\u6700\u5927\u9650\u5ea6\u51cf\u5c11\u4eba\u5458\u4f24\u4ea1\u548c\u7ecf\u6d4e\u635f\u5931\u3002", category: "\u5e94\u6025\u7ba1\u7406", background: "## \u653f\u7b56\u80cc\u666f\n\n\u7a81\u53d1\u6027\u81ea\u7136\u707e\u5bb3\uff08\u5730\u9707\u3001\u6d2a\u6d9d\u3001\u53f0\u98ce\uff09\u7684\u5e94\u6025\u54cd\u5e94\u6548\u7387\u76f4\u63a5\u5173\u7cfb\u4eba\u6c11\u7fa4\u4f17\u751f\u547d\u8d22\u4ea7\u5b89\u5168\u3002\u5982\u4f55\u79d1\u5b66\u914d\u7f6e\u6709\u9650\u7684\u5e94\u6025\u8d44\u6e90\uff0c\u662f\u672c\u6848\u4f8b\u63a2\u8ba8\u7684\u6838\u5fc3\u95ee\u9898\u3002", config: JSON.stringify(this.heroProCase()), },
      { title: "GIS \u667a\u6167\u57ce\u5e02\u7ba1\u7406", description: "\u90e8\u7f72\u7269\u8054\u7f51\u4f20\u611f\u5668\u3001\u4eba\u5de5\u667a\u80fd\u5206\u6790\u548c\u6570\u636e\u5f00\u653e\u5e73\u53f0\uff0c\u4f18\u5316\u57ce\u5e02\u4ea4\u901a\u3001\u80fd\u6e90\u6d88\u8017\u548c\u516c\u5171\u670d\u52a1\u7cfb\u7edf\u3002", category: "\u667a\u6167\u57ce\u5e02", background: "## \u653f\u7b56\u80cc\u666f\n\n\u667a\u6167\u57ce\u5e02\u5229\u7528\u6570\u5b57\u6280\u672f\u63d0\u5347\u57ce\u5e02\u6cbb\u7406\u80fd\u529b\u548c\u5c45\u6c11\u751f\u6d3b\u8d28\u91cf\u3002\u672c\u6848\u4f8b\u63a2\u8ba8\u5982\u4f55\u901a\u8fc7\u4e0d\u540c\u6280\u672f\u65b9\u6848\u7684\u7ec4\u5408\uff0c\u5b9e\u73b0\u57ce\u5e02\u8fd0\u884c\u6548\u7387\u7684\u6700\u5927\u5316\u3002", config: JSON.stringify(this.gisCase()), },
    ];
  }

  private taxPolicyCase() {
    return {
      parameters: [
        { id: 'vat_rate', name: 'vat_rate', label: '\u589e\u503c\u7a0e\u7387', type: 'slider', min: 5, max: 25, step: 0.5, default: 13, unit: '%' },
        { id: 'corp_tax_rate', name: 'corp_tax_rate', label: '\u4f01\u4e1a\u6240\u5f97\u7a0e\u7387', type: 'slider', min: 10, max: 35, step: 1, default: 25, unit: '%' },
        { id: 'small_tax_break', name: 'small_tax_break', label: '\u5c0f\u5fae\u4f01\u4e1a\u4f18\u60e0\u5e45\u5ea6', type: 'slider', min: 0, max: 100, step: 5, default: 50, unit: '%' },
        { id: 'tax_zone', name: 'tax_zone', label: '\u7a0e\u6536\u4f18\u60e0\u533a\u57df', type: 'select', options: [
          { label: '\u65e0\u4f18\u60e0\u533a', value: 0 }, { label: '\u666e\u901a\u4f18\u60e0\u533a', value: 1 }, { label: '\u91cd\u70b9\u4f18\u60e0\u533a', value: 2 }, { label: '\u81ea\u8d38\u8bd5\u9a8c\u533a', value: 3 }
        ], default: 0, unit: '' },
      ],
      indicators: [
        { id: 'gdp_growth', name: 'gdp_growth', label: 'GDP\u589e\u957f\u7387', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'gov_revenue', name: 'gov_revenue', label: '\u653f\u5e9c\u8d22\u653f\u6536\u5165', unit: '\u4ebf\u5143', format: 'number', higherIsBetter: false },
        { id: 'gini', name: 'gini', label: '\u57fa\u5c3c\u7cfb\u6570', unit: '', format: 'number', higherIsBetter: false },
        { id: 'business_investment', name: 'business_investment', label: '\u4f01\u4e1a\u6295\u8d44\u6307\u6570', unit: '', format: 'number', higherIsBetter: true },
        { id: 'employment', name: 'employment', label: '\u5c31\u4e1a\u7387', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'consumer_price', name: 'consumer_price', label: '\u6d88\u8d39\u8005\u4ef7\u683c\u6307\u6570', unit: '', format: 'number', higherIsBetter: false },
      ],
      formulas: [
        { indicatorId: 'gdp_growth', expression: '12 - 0.25 * (params.vat_rate - 13) - 0.15 * (params.corp_tax_rate - 25) + 0.3 * (params.small_tax_break / 50) + 0.5 * params.tax_zone + (Math.sin(params.vat_rate * 0.2) * 0.5)' },
        { indicatorId: 'gov_revenue', expression: '800 + params.vat_rate * 20 + params.corp_tax_rate * 15 - params.small_tax_break * 2 + params.tax_zone * 30 + (Math.random() * 10 - 5)' },
        { indicatorId: 'gini', expression: '0.45 - 0.002 * params.small_tax_break + 0.003 * params.vat_rate - 0.01 * params.tax_zone + (Math.sin(params.corp_tax_rate * 0.05) * 0.02)' },
        { indicatorId: 'business_investment', expression: '60 + 0.5 * (25 - params.corp_tax_rate) + 0.2 * params.small_tax_break + 5 * params.tax_zone - 0.3 * params.vat_rate + (Math.cos(params.corp_tax_rate * 0.1) * 2)' },
        { indicatorId: 'employment', expression: '94 + 0.05 * (25 - params.corp_tax_rate) + 0.02 * params.small_tax_break + 0.01 * (13 - params.vat_rate) + 1 * params.tax_zone + (Math.sin(params.vat_rate * 0.15) * 0.3)' },
        { indicatorId: 'consumer_price', expression: '102 - 0.1 * params.vat_rate + 0.05 * params.corp_tax_rate + 0.2 * params.tax_zone + (Math.random() * 0.5)' },
      ],
    };
  }

  private environmentCase() {
    return {
      parameters: [
        { id: 'emission_standard', name: 'emission_standard', label: '\u6392\u653e\u6807\u51c6\u4e25\u683c\u5ea6', type: 'slider', min: 1, max: 10, step: 0.5, default: 5, unit: '\u7ea7' },
        { id: 'pollution_tax', name: 'pollution_tax', label: '\u6c61\u67d3\u7a0e\u7a0e\u7387', type: 'slider', min: 0, max: 500, step: 10, default: 100, unit: '\u5143/\u5428' },
        { id: 'green_subsidy', name: 'green_subsidy', label: '\u7eff\u8272\u8865\u8d34\u91d1\u989d', type: 'slider', min: 0, max: 200, step: 10, default: 50, unit: '\u4ebf\u5143' },
        { id: 'enforce_strictness', name: 'enforce_strictness', label: '\u6267\u6cd5\u4e25\u683c\u5ea6', type: 'select', options: [
          { label: '\u5bbd\u677e', value: 0 }, { label: '\u4e00\u822c', value: 1 }, { label: '\u4e25\u683c', value: 2 }, { label: '\u6781\u4e25', value: 3 }
        ], default: 1, unit: '' },
      ],
      indicators: [
        { id: 'air_quality', name: 'air_quality', label: '\u7a7a\u6c14\u8d28\u91cf\u6307\u6570(AQI)', unit: '', format: 'number', higherIsBetter: false },
        { id: 'industry_output', name: 'industry_output', label: '\u5de5\u4e1a\u603b\u4ea7\u503c', unit: '\u4ebf\u5143', format: 'number', higherIsBetter: true },
        { id: 'green_jobs', name: 'green_jobs', label: '\u7eff\u8272\u5c31\u4e1a\u5c97\u4f4d', unit: '\u4e07\u4e2a', format: 'number', higherIsBetter: true },
        { id: 'env_revenue', name: 'env_revenue', label: '\u73af\u5883\u7a0e\u6536\u5165', unit: '\u4ebf\u5143', format: 'number', higherIsBetter: false },
        { id: 'public_satisfaction', name: 'public_satisfaction', label: '\u516c\u4f17\u6ee1\u610f\u5ea6', unit: '%', format: 'percent', higherIsBetter: true },
      ],
      formulas: [
        { indicatorId: 'air_quality', expression: '80 - 5 * params.emission_standard - 0.05 * params.pollution_tax + 0.1 * params.green_subsidy - 8 * params.enforce_strictness + (Math.sin(params.emission_standard * 0.5) * 3)' },
        { indicatorId: 'industry_output', expression: '5000 - 100 * params.emission_standard - 2 * params.pollution_tax + 15 * params.green_subsidy - 50 * params.enforce_strictness + 200 * Math.log(params.emission_standard + 1)' },
        { indicatorId: 'green_jobs', expression: '20 + 3 * params.emission_standard + 0.15 * params.green_subsidy + 5 * params.enforce_strictness + (Math.random() * 2)' },
        { indicatorId: 'env_revenue', expression: '0 + params.pollution_tax * 0.5 + params.emission_standard * 10 + (Math.sin(params.pollution_tax * 0.01) * 20)' },
        { indicatorId: 'public_satisfaction', expression: '50 - params.air_quality * 0.5 + params.green_jobs * 0.5 + 5 * params.enforce_strictness + (Math.random() * 5)' },
      ],
    };
  }

  private welfareCase() {
    return {
      parameters: [
        { id: 'welfare_spending', name: 'welfare_spending', label: '\u793e\u4f1a\u4fdd\u969c\u652f\u51fa', type: 'slider', min: 100, max: 2000, step: 50, default: 500, unit: '\u4ebf\u5143' },
        { id: 'min_wage', name: 'min_wage', label: '\u6700\u4f4e\u5de5\u8d44\u6807\u51c6', type: 'slider', min: 2000, max: 6000, step: 100, default: 3000, unit: '\u5143/\u6708' },
        { id: 'unemployment_benefit', name: 'unemployment_benefit', label: '\u5931\u4e1a\u6551\u6d4e\u66ff\u4ee3\u7387', type: 'slider', min: 20, max: 80, step: 5, default: 40, unit: '%' },
        { id: 'healthcare_coverage', name: 'healthcare_coverage', label: '\u533b\u7597\u4fdd\u969c\u8986\u76d6\u7387', type: 'select', options: [
          { label: '\u57fa\u7840\u8986\u76d6(60%)', value: 60 }, { label: '\u4e2d\u7b49\u8986\u76d6(75%)', value: 75 }, { label: '\u5168\u9762\u8986\u76d6(90%)', value: 90 }, { label: '\u5168\u6c11\u514d\u8d39(100%)', value: 100 }
        ], default: 75, unit: '%' },
      ],
      indicators: [
        { id: 'poverty_rate', name: 'poverty_rate', label: '\u8d2b\u56f0\u7387', unit: '%', format: 'percent', higherIsBetter: false },
        { id: 'fiscal_deficit', name: 'fiscal_deficit', label: '\u8d22\u653f\u8d64\u5b57\u7387', unit: '%', format: 'percent', higherIsBetter: false },
        { id: 'life_expectancy', name: 'life_expectancy', label: '\u4eba\u5747\u9884\u671f\u5bff\u547d', unit: '\u5c81', format: 'number', higherIsBetter: true },
        { id: 'social_stability', name: 'social_stability', label: '\u793e\u4f1a\u7a33\u5b9a\u6307\u6570', unit: '', format: 'number', higherIsBetter: true },
        { id: 'labor_participation', name: 'labor_participation', label: '\u52b3\u52a8\u53c2\u4e0e\u7387', unit: '%', format: 'percent', higherIsBetter: true },
      ],
      formulas: [
        { indicatorId: 'poverty_rate', expression: '15 - 0.005 * params.welfare_spending - 0.001 * params.min_wage - 0.05 * params.unemployment_benefit - 0.05 * params.healthcare_coverage + 5 + (Math.sin(params.welfare_spending * 0.002) * 0.5)' },
        { indicatorId: 'fiscal_deficit', expression: '3 + 0.002 * params.welfare_spending + 0.0003 * params.min_wage + 0.01 * params.unemployment_benefit + 0.02 * params.healthcare_coverage - 1.5 + (Math.cos(params.welfare_spending * 0.001) * 0.3)' },
        { indicatorId: 'life_expectancy', expression: '76 + 0.001 * params.welfare_spending + 0.0002 * params.min_wage + 0.02 * params.unemployment_benefit + 0.03 * params.healthcare_coverage + (Math.sin(params.welfare_spending * 0.001) * 0.3)' },
        { indicatorId: 'social_stability', expression: '5 + 0.002 * params.welfare_spending + 0.0005 * params.min_wage + 0.02 * params.unemployment_benefit + 0.02 * params.healthcare_coverage - 0.01 * (15 - 0.005 * params.welfare_spending) + (Math.random() * 0.5)' },
        { indicatorId: 'labor_participation', expression: '65 - 0.001 * params.welfare_spending + 0.0005 * params.min_wage - 0.05 * params.unemployment_benefit + 0.05 * params.healthcare_coverage + (Math.sin(params.min_wage * 0.0003) * 1)' },
      ],
    };
  }

  private housingCase() {
    return {
      parameters: [
        { id: 'property_tax', name: 'property_tax', label: '\u623f\u4ea7\u7a0e\u7a0e\u7387', type: 'slider', min: 0, max: 5, step: 0.1, default: 1, unit: '%' },
        { id: 'land_supply', name: 'land_supply', label: '\u4f4f\u5b85\u7528\u5730\u4f9b\u5e94', type: 'slider', min: 100, max: 2000, step: 50, default: 500, unit: '\u516c\u9877' },
        { id: 'mortgage_rate', name: 'mortgage_rate', label: '\u8d37\u6b3e\u5229\u7387', type: 'slider', min: 2, max: 8, step: 0.25, default: 4.5, unit: '%' },
        { id: 'purchase_restriction', name: 'purchase_restriction', label: '\u9650\u8d2d\u653f\u7b56\u5f3a\u5ea6', type: 'select', options: [
          { label: '\u65e0\u9650\u8d2d', value: 0 }, { label: '\u6e29\u548c\u9650\u8d2d', value: 1 }, { label: '\u4e25\u683c\u9650\u8d2d', value: 2 }, { label: '\u5168\u9762\u9650\u8d2d', value: 3 }
        ], default: 0, unit: '' },
      ],
      indicators: [
        { id: 'housing_price', name: 'housing_price', label: '\u623f\u4ef7\u6307\u6570', unit: '', format: 'number', higherIsBetter: false },
        { id: 'vacancy_rate', name: 'vacancy_rate', label: '\u4f4f\u623f\u7a7a\u7f6e\u7387', unit: '%', format: 'percent', higherIsBetter: false },
        { id: 'local_revenue_land', name: 'local_revenue_land', label: '\u571f\u5730\u51fa\u8ba9\u6536\u5165', unit: '\u4ebf\u5143', format: 'currency', higherIsBetter: false },
        { id: 'affordability', name: 'affordability', label: '\u5c45\u6c11\u8d2d\u623f\u80fd\u529b\u6307\u6570', unit: '', format: 'number', higherIsBetter: true },
        { id: 'construction_employment', name: 'construction_employment', label: '\u5efa\u7b51\u4e1a\u5c31\u4e1a', unit: '\u4e07\u4eba', format: 'number', higherIsBetter: true },
      ],
      formulas: [
        { indicatorId: 'housing_price', expression: '200 - 15 * params.property_tax - 0.05 * params.land_supply - 8 * params.mortgage_rate - 20 * params.purchase_restriction + 100 + (Math.sin(params.property_tax * 0.5) * 5)' },
        { indicatorId: 'vacancy_rate', expression: '20 - 2 * params.property_tax + 0.005 * params.land_supply + 1.5 * params.mortgage_rate - 2 * params.purchase_restriction + (Math.cos(params.land_supply * 0.002) * 1)' },
        { indicatorId: 'local_revenue_land', expression: '8000 - 300 * params.property_tax + params.land_supply * 4 - 200 * params.purchase_restriction + (Math.sin(params.land_supply * 0.001) * 100)' },
        { indicatorId: 'affordability', expression: '50 + 5 * params.property_tax + 0.02 * params.land_supply - 5 * params.mortgage_rate + 10 * params.purchase_restriction + (Math.cos(params.mortgage_rate * 0.2) * 2)' },
        { indicatorId: 'construction_employment', expression: '500 - 20 * params.property_tax + 0.1 * params.land_supply - 10 * params.mortgage_rate - 30 * params.purchase_restriction + (Math.sin(params.land_supply * 0.001) * 10)' },
      ],
    };
  }

  private innovationCase() {
    return {
      parameters: [
        { id: 'rd_subsidy', name: 'rd_subsidy', label: '\u7814\u53d1\u8865\u8d34\u91d1\u989d', type: 'slider', min: 0, max: 500, step: 10, default: 100, unit: '\u4ebf\u5143' },
        { id: 'patent_protection', name: 'patent_protection', label: '\u77e5\u8bc6\u4ea7\u6743\u4fdd\u62a4\u5f3a\u5ea6', type: 'slider', min: 1, max: 10, step: 0.5, default: 5, unit: '\u7ea7' },
        { id: 'edu_investment', name: 'edu_investment', label: '\u6559\u80b2\u6295\u8d44', type: 'slider', min: 2000, max: 10000, step: 100, default: 4000, unit: '\u4ebf\u5143' },
        { id: 'talent_attraction', name: 'talent_attraction', label: '\u4eba\u624d\u5438\u5f15\u529b', type: 'select', options: [
          { label: '\u57fa\u7840\u5438\u5f15', value: 0 }, { label: '\u4e2d\u7b49\u5438\u5f15', value: 1 }, { label: '\u5f3a\u529b\u5438\u5f15', value: 2 }, { label: '\u5168\u7403\u9876\u5c16', value: 3 }
        ], default: 0, unit: '' },
      ],
      indicators: [
        { id: 'patent_count', name: 'patent_count', label: '\u4e13\u5229\u7533\u8bf7\u6570', unit: '\u4e07\u4ef6', format: 'number', higherIsBetter: true },
        { id: 'high_tech_output', name: 'high_tech_output', label: '\u9ad8\u6280\u672f\u4ea7\u4e1a\u4ea7\u503c', unit: '\u4ebf\u5143', format: 'currency', higherIsBetter: true },
        { id: 'rd_intensity', name: 'rd_intensity', label: '\u7814\u53d1\u6295\u5165\u5f3a\u5ea6(R&D/GDP)', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'talent_inflow', name: 'talent_inflow', label: '\u9ad8\u7aef\u4eba\u624d\u51c0\u6d41\u5165', unit: '\u4e07\u4eba', format: 'number', higherIsBetter: true },
        { id: 'tech_innovation_index', name: 'tech_innovation_index', label: '\u7efc\u5408\u79d1\u6280\u521b\u65b0\u6307\u6570', unit: '', format: 'number', higherIsBetter: true },
      ],
      formulas: [
        { indicatorId: 'patent_count', expression: '50 + 0.2 * params.rd_subsidy + 5 * params.patent_protection + 0.005 * params.edu_investment + 10 * params.talent_attraction + (Math.sin(params.rd_subsidy * 0.01) * 3)' },
        { indicatorId: 'high_tech_output', expression: '15000 + 30 * params.rd_subsidy + 500 * params.patent_protection + 2 * params.edu_investment + 1000 * params.talent_attraction + (Math.cos(params.rd_subsidy * 0.005) * 200)' },
        { indicatorId: 'rd_intensity', expression: '2.0 + 0.005 * params.rd_subsidy + 0.1 * params.patent_protection + 0.0002 * params.edu_investment + 0.2 * params.talent_attraction + (Math.sin(params.edu_investment * 0.0001) * 0.05)' },
        { indicatorId: 'talent_inflow', expression: '5 + 0.02 * params.rd_subsidy + 1 * params.patent_protection + 0.003 * params.edu_investment + 5 * params.talent_attraction + (Math.random() * 2)' },
        { indicatorId: 'tech_innovation_index', expression: '40 + 0.1 * params.rd_subsidy + 3 * params.patent_protection + 0.005 * params.edu_investment + 8 * params.talent_attraction + (Math.sin(params.rd_subsidy * 0.008) * 2)' },
      ],
    };
  }

  private heroProCase() {
    return {
      parameters: [
        { id: 'response_time', name: 'response_time', label: '\u5e94\u6025\u54cd\u5e94\u65f6\u95f4', type: 'slider', min: 0.5, max: 24, step: 0.5, default: 6, unit: '\u5c0f\u65f6' },
        { id: 'rescue_teams', name: 'rescue_teams', label: '\u6551\u63f4\u961f\u4f0d\u6570\u91cf', type: 'slider', min: 5, max: 100, step: 5, default: 30, unit: '\u652f' },
        { id: 'evacuation_radius', name: 'evacuation_radius', label: '\u758f\u6563\u534a\u5f84', type: 'slider', min: 1, max: 20, step: 1, default: 5, unit: '\u516c\u91cc' },
        { id: 'supply_reserve', name: 'supply_reserve', label: '\u5e94\u6025\u7269\u8d44\u50a8\u5907', type: 'slider', min: 10, max: 100, step: 5, default: 40, unit: '%' },
        { id: 'comm_strategy', name: 'comm_strategy', label: '\u5371\u673a\u6c9f\u901a\u7b56\u7565', type: 'select', options: [
          { label: '\u5185\u90e8\u901a\u62a5', value: 0 }, { label: '\u6709\u9650\u516c\u5f00', value: 1 }, { label: '\u5b9e\u65f6\u516c\u5f00', value: 2 }, { label: '\u591a\u7ef4\u5168\u516c\u5f00', value: 3 }
        ], default: 1, unit: '' },
      ],
      indicators: [
        { id: 'casualties', name: 'casualties', label: '\u9884\u8ba1\u4f24\u4ea1\u4eba\u6570', unit: '\u4eba', format: 'number', higherIsBetter: false },
        { id: 'econ_loss', name: 'econ_loss', label: '\u7ecf\u6d4e\u635f\u5931', unit: '\u4ebf\u5143', format: 'currency', higherIsBetter: false },
        { id: 'rescue_efficiency', name: 'rescue_efficiency', label: '\u6551\u63f4\u6548\u7387', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'public_trust', name: 'public_trust', label: '\u516c\u4f17\u4fe1\u4efb\u5ea6', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'infra_damage', name: 'infra_damage', label: '\u57fa\u7840\u8bbe\u65bd\u635f\u574f', unit: '%', format: 'percent', higherIsBetter: false },
      ],
      formulas: [
        { indicatorId: 'casualties', expression: 'Math.round(500 - 10 * params.rescue_teams - 3 * params.evacuation_radius + 8 * params.response_time - 2 * params.supply_reserve + 20 * params.comm_strategy - 100 + (Math.sin(params.response_time * 0.3) * 30))' },
        { indicatorId: 'econ_loss', expression: '100 - 1.5 * params.rescue_teams - 0.5 * params.evacuation_radius + 3 * params.response_time - 0.3 * params.supply_reserve + 5 * params.comm_strategy + 20 + (Math.cos(params.response_time * 0.2) * 10)' },
        { indicatorId: 'rescue_efficiency', expression: '30 + 0.5 * params.rescue_teams + 1.5 * params.evacuation_radius - 1.5 * params.response_time + 0.4 * params.supply_reserve + 5 * params.comm_strategy + (Math.sin(params.rescue_teams * 0.05) * 3)' },
        { indicatorId: 'public_trust', expression: '40 + 0.2 * params.rescue_teams + 0.5 * params.evacuation_radius - 2 * params.response_time + 0.3 * params.supply_reserve + 12 * params.comm_strategy + (Math.random() * 5)' },
        { indicatorId: 'infra_damage', expression: '60 - 0.3 * params.rescue_teams - 0.8 * params.evacuation_radius + 2 * params.response_time - 0.2 * params.supply_reserve + 3 * params.comm_strategy - 10 + (Math.sin(params.evacuation_radius * 0.2) * 5)' },
      ],
    };
  }

  private gisCase() {
    return {
      parameters: [
        { id: 'sensor_density', name: 'sensor_density', label: '\u4f20\u611f\u5668\u8986\u76d6\u7387', type: 'slider', min: 10, max: 100, step: 5, default: 40, unit: '%' },
        { id: 'ai_investment', name: 'ai_investment', label: 'AI\u5206\u6790\u6280\u672f\u6295\u5165', type: 'slider', min: 10, max: 100, step: 5, default: 40, unit: '%' },
        { id: 'traffic_optimization', name: 'traffic_optimization', label: '\u4ea4\u901a\u4f18\u5316\u529b\u5ea6', type: 'slider', min: 0, max: 100, step: 5, default: 40, unit: '%' },
        { id: 'smart_grid', name: 'smart_grid', label: '\u667a\u80fd\u7535\u7f51\u8986\u76d6\u7387', type: 'slider', min: 10, max: 100, step: 5, default: 40, unit: '%' },
        { id: 'data_openness', name: 'data_openness', label: '\u6570\u636e\u5f00\u653e\u7a0b\u5ea6', type: 'select', options: [
          { label: '\u5c01\u95ed', value: 0 }, { label: '\u6709\u9650\u5f00\u653e', value: 1 }, { label: '\u653f\u5e9c\u5185\u90e8\u5171\u4eab', value: 2 }, { label: '\u5168\u9762\u5f00\u653e+API', value: 3 }
        ], default: 1, unit: '' },
      ],
      indicators: [
        { id: 'traffic_efficiency', name: 'traffic_efficiency', label: '\u4ea4\u901a\u901a\u884c\u6548\u7387', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'energy_savings', name: 'energy_savings', label: '\u80fd\u6e90\u8282\u7ea6\u7387', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'env_index', name: 'env_index', label: '\u57ce\u5e02\u73af\u5883\u6307\u6570', unit: '', format: 'number', higherIsBetter: true },
        { id: 'gov_efficiency', name: 'gov_efficiency', label: '\u653f\u5e9c\u670d\u52a1\u6548\u7387', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'digital_life', name: 'digital_life', label: '\u5c45\u6c11\u6570\u5b57\u5316\u751f\u6d3b\u6307\u6570', unit: '', format: 'number', higherIsBetter: true },
      ],
      formulas: [
        { indicatorId: 'traffic_efficiency', expression: '40 + 0.3 * params.sensor_density + 0.2 * params.ai_investment + 0.4 * params.traffic_optimization + 2 * params.data_openness + (Math.sin(params.traffic_optimization * 0.03) * 3)' },
        { indicatorId: 'energy_savings', expression: '10 + 0.15 * params.sensor_density + 0.2 * params.ai_investment + 0.1 * params.traffic_optimization + 0.3 * params.smart_grid + 1 * params.data_openness + (Math.cos(params.smart_grid * 0.02) * 2)' },
        { indicatorId: 'env_index', expression: '50 + 0.2 * params.sensor_density + 0.15 * params.ai_investment + 0.1 * params.traffic_optimization + 0.15 * params.smart_grid + 3 * params.data_openness + (Math.sin(params.sensor_density * 0.02) * 3)' },
        { indicatorId: 'gov_efficiency', expression: '40 + 0.2 * params.sensor_density + 0.3 * params.ai_investment + 0.1 * params.traffic_optimization + 0.1 * params.smart_grid + 5 * params.data_openness + (Math.random() * 5)' },
        { indicatorId: 'digital_life', expression: '30 + 0.25 * params.sensor_density + 0.3 * params.ai_investment + 0.15 * params.traffic_optimization + 0.2 * params.smart_grid + 8 * params.data_openness + (Math.sin(params.ai_investment * 0.02) * 3)' },
      ],
    };
  }
}
