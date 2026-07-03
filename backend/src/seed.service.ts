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

    // Check if we already have valid seed data
    const caseCheck = await this.caseRepo.findOne({ where: { title: '税收政策对宏观经济的影响' } });
    if (caseCheck) {
      console.log('Database already has valid seed data, skipping seed');
      return;
    }

    // If cases exist but with garbled titles, re-seed them
    if (caseCount > 0) {
      console.log('Detected garbled/unexpected case data, re-seeding cases...');
      await this.caseRepo.clear();
    }

    if (userCount > 0) {
      console.log('Users exist, will seed cases only');
      const cases = this.buildCases();
      await this.caseRepo.save(cases);
      console.log('Cases seeded successfully!');
      return;
    }

    console.log('Seeding database...');

    const hashedPwd = await bcrypt.hash('123456', 10);

    await this.userRepo.save([
      { username: 'admin', password: hashedPwd, displayName: '系统管理员', role: UserRole.ADMIN },
      { username: 'teacher1', password: hashedPwd, displayName: '张老师', role: UserRole.TEACHER },
      { username: 'teacher2', password: hashedPwd, displayName: '王老师', role: UserRole.TEACHER },
      { username: 'student1', password: hashedPwd, displayName: '李同学', role: UserRole.STUDENT },
      { username: 'student2', password: hashedPwd, displayName: '赵同学', role: UserRole.STUDENT },
      { username: 'student3', password: hashedPwd, displayName: '陈同学', role: UserRole.STUDENT },
    ]);

    const cases = this.buildCases();
    await this.caseRepo.save(cases);

    console.log('Seed completed successfully!');
  }

  private buildCases(): Partial<PolicyCase>[] {
    return [
      {
        title: '税收政策对宏观经济的影响',
        description: '模拟增值税率、企业所得税率等税收工具，观察对GDP、企业投资、就业等宏观经济指标的影响。',
        category: '财政税收',
        background: '## 政策背景\n\n税收政策是国家宏观调控的重要工具。当前我国经济面临下行压力，如何通过税收政策的调整"减税降费、优化结构"成为当前面临的关键问题。\n\n## 实验目标\n\n通过调整不同的税收工具参数，观察各项宏观经济指标的变化趋势，理解税收政策对经济运行的影响机制。',
        config: JSON.stringify(this.taxPolicyCase()),
      },
      {
        title: '环境保护与经济发展的平衡',
        description: '探索排放标准、污染税、绿色补贴等环境政策工具，如何在改善环境质量的同时促进企业转型和就业。',
        category: '环境政策',
        background: '## 政策背景\n\n经济发展与环境保护之间的平衡是可持续发展的核心挑战。如何在保持经济增长的同时改善环境质量，是各国政府面临的重要政策问题。',
        config: JSON.stringify(this.environmentCase()),
      },
      {
        title: '社会保障支出与社会稳定',
        description: '调整社会保障支出、最低工资、失业救济金和医疗保障覆盖率，评估对贫困率、社会稳定和财政可持续性的综合影响。',
        category: '社会保障',
        background: '## 政策背景\n\n完善的社会保障体系是人民生活的重要保障。在人口老龄化加速的背景下，如何平衡保障水平与财政可持续性成为政策制定者必须面对的关键挑战。',
        config: JSON.stringify(this.welfareCase()),
      },
      {
        title: '房地产调控与市场稳定',
        description: '运用房产税、土地供应、贷款利率和限购政策等工具，实现"住有所居"目标，促进房地产市场健康发展。',
        category: '住房政策',
        background: '## 政策背景\n\n房地产市场的平稳健康发展关系经济全局和人民群众的切身利益。如何通过政策工具组合实现"房住不炒"的目标，是本实验探讨的重点。',
        config: JSON.stringify(this.housingCase()),
      },
      {
        title: '科技创新驱动产业升级',
        description: '通过研发补贴、知识产权保护、教育投资和人才吸引政策，推动科技创新和产业结构升级。',
        category: '科技政策',
        background: '## 政策背景\n\n科技创新是引领发展的第一动力。在当前全球经济竞争加剧的背景下，如何通过政策组合拳提升国家创新能力，推动产业向价值链高端攀升，是政策制定者关注的核心议题。',
        config: JSON.stringify(this.innovationCase()),
      },
      {
        title: 'HeroPro 应急灾害响应',
        description: '模拟自然灾害应急响应中的资源调度、人员疏散和危机沟通策略，最大限度减少人员伤亡和经济损失。',
        category: '应急管理',
        background: '## 政策背景\n\n突发性自然灾害（地震、洪涝、台风）的应急响应效率直接关系人民群众生命财产安全。如何科学配置有限的应急资源，是本案例探讨的核心问题。',
        config: JSON.stringify(this.heroProCase()),
      },
      {
        title: 'GIS 智慧城市管理',
        description: '部署物联网传感器、人工智能分析和数据开放平台，优化城市交通、能源消耗和公共服务系统。',
        category: '智慧城市',
        background: '## 政策背景\n\n智慧城市利用数字技术提升城市治理能力和居民生活质量。本案例探讨如何通过不同技术方案的组合，实现城市运行效率的最大化。',
        config: JSON.stringify(this.gisCase()),
      },
    ];
  }

  private taxPolicyCase() {
    return {
      parameters: [
        { id: 'vat_rate', name: 'vat_rate', label: '增值税率', type: 'slider', min: 5, max: 25, step: 0.5, default: 13, unit: '%' },
        { id: 'corp_tax_rate', name: 'corp_tax_rate', label: '企业所得税率', type: 'slider', min: 10, max: 35, step: 1, default: 25, unit: '%' },
        { id: 'small_tax_break', name: 'small_tax_break', label: '小微企业优惠幅度', type: 'slider', min: 0, max: 100, step: 5, default: 50, unit: '%' },
        { id: 'tax_zone', name: 'tax_zone', label: '税收优惠区域', type: 'select', options: [
          { label: '无优惠区', value: 0 }, { label: '普通优惠区', value: 1 }, { label: '重点优惠区', value: 2 }, { label: '自贸试验区', value: 3 }
        ], default: 0, unit: '' },
      ],
      indicators: [
        { id: 'gdp_growth', name: 'gdp_growth', label: 'GDP增长率', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'gov_revenue', name: 'gov_revenue', label: '政府财政收入', unit: '亿元', format: 'number', higherIsBetter: false },
        { id: 'gini', name: 'gini', label: '基尼系数', unit: '', format: 'number', higherIsBetter: false },
        { id: 'business_investment', name: 'business_investment', label: '企业投资指数', unit: '', format: 'number', higherIsBetter: true },
        { id: 'employment', name: 'employment', label: '就业率', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'consumer_price', name: 'consumer_price', label: '消费者价格指数', unit: '', format: 'number', higherIsBetter: false },
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
        { id: 'emission_standard', name: 'emission_standard', label: '排放标准严格度', type: 'slider', min: 1, max: 10, step: 0.5, default: 5, unit: '级' },
        { id: 'pollution_tax', name: 'pollution_tax', label: '污染税税率', type: 'slider', min: 0, max: 500, step: 10, default: 100, unit: '元/吨' },
        { id: 'green_subsidy', name: 'green_subsidy', label: '绿色补贴金额', type: 'slider', min: 0, max: 200, step: 10, default: 50, unit: '亿元' },
        { id: 'enforce_strictness', name: 'enforce_strictness', label: '执法严格度', type: 'select', options: [
          { label: '宽松', value: 0 }, { label: '一般', value: 1 }, { label: '严格', value: 2 }, { label: '极严', value: 3 }
        ], default: 1, unit: '' },
      ],
      indicators: [
        { id: 'air_quality', name: 'air_quality', label: '空气质量指数(AQI)', unit: '', format: 'number', higherIsBetter: false },
        { id: 'industry_output', name: 'industry_output', label: '工业总产值', unit: '亿元', format: 'number', higherIsBetter: true },
        { id: 'green_jobs', name: 'green_jobs', label: '绿色就业岗位', unit: '万个', format: 'number', higherIsBetter: true },
        { id: 'env_revenue', name: 'env_revenue', label: '环境税收入', unit: '亿元', format: 'number', higherIsBetter: false },
        { id: 'public_satisfaction', name: 'public_satisfaction', label: '公众满意度', unit: '%', format: 'percent', higherIsBetter: true },
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
        { id: 'welfare_spending', name: 'welfare_spending', label: '社会保障支出', type: 'slider', min: 100, max: 2000, step: 50, default: 500, unit: '亿元' },
        { id: 'min_wage', name: 'min_wage', label: '最低工资标准', type: 'slider', min: 2000, max: 6000, step: 100, default: 3000, unit: '元/月' },
        { id: 'unemployment_benefit', name: 'unemployment_benefit', label: '失业救济替代率', type: 'slider', min: 20, max: 80, step: 5, default: 40, unit: '%' },
        { id: 'healthcare_coverage', name: 'healthcare_coverage', label: '医疗保障覆盖率', type: 'select', options: [
          { label: '基础覆盖(60%)', value: 60 }, { label: '中等覆盖(75%)', value: 75 }, { label: '全面覆盖(90%)', value: 90 }, { label: '全民免费(100%)', value: 100 }
        ], default: 75, unit: '%' },
      ],
      indicators: [
        { id: 'poverty_rate', name: 'poverty_rate', label: '贫困率', unit: '%', format: 'percent', higherIsBetter: false },
        { id: 'fiscal_deficit', name: 'fiscal_deficit', label: '财政赤字率', unit: '%', format: 'percent', higherIsBetter: false },
        { id: 'life_expectancy', name: 'life_expectancy', label: '人均预期寿命', unit: '岁', format: 'number', higherIsBetter: true },
        { id: 'social_stability', name: 'social_stability', label: '社会稳定指数', unit: '', format: 'number', higherIsBetter: true },
        { id: 'labor_participation', name: 'labor_participation', label: '劳动参与率', unit: '%', format: 'percent', higherIsBetter: true },
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
        { id: 'property_tax', name: 'property_tax', label: '房产税税率', type: 'slider', min: 0, max: 5, step: 0.1, default: 1, unit: '%' },
        { id: 'land_supply', name: 'land_supply', label: '住宅用地供应', type: 'slider', min: 100, max: 2000, step: 50, default: 500, unit: '公顷' },
        { id: 'mortgage_rate', name: 'mortgage_rate', label: '贷款利率', type: 'slider', min: 2, max: 8, step: 0.25, default: 4.5, unit: '%' },
        { id: 'purchase_restriction', name: 'purchase_restriction', label: '限购政策强度', type: 'select', options: [
          { label: '无限购', value: 0 }, { label: '温和限购', value: 1 }, { label: '严格限购', value: 2 }, { label: '全面限购', value: 3 }
        ], default: 0, unit: '' },
      ],
      indicators: [
        { id: 'housing_price', name: 'housing_price', label: '房价指数', unit: '', format: 'number', higherIsBetter: false },
        { id: 'vacancy_rate', name: 'vacancy_rate', label: '住房空置率', unit: '%', format: 'percent', higherIsBetter: false },
        { id: 'local_revenue_land', name: 'local_revenue_land', label: '土地出让收入', unit: '亿元', format: 'currency', higherIsBetter: false },
        { id: 'affordability', name: 'affordability', label: '居民购房能力指数', unit: '', format: 'number', higherIsBetter: true },
        { id: 'construction_employment', name: 'construction_employment', label: '建筑业就业', unit: '万人', format: 'number', higherIsBetter: true },
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
        { id: 'rd_subsidy', name: 'rd_subsidy', label: '研发补贴金额', type: 'slider', min: 0, max: 500, step: 10, default: 100, unit: '亿元' },
        { id: 'patent_protection', name: 'patent_protection', label: '知识产权保护强度', type: 'slider', min: 1, max: 10, step: 0.5, default: 5, unit: '级' },
        { id: 'edu_investment', name: 'edu_investment', label: '教育投资', type: 'slider', min: 2000, max: 10000, step: 100, default: 4000, unit: '亿元' },
        { id: 'talent_attraction', name: 'talent_attraction', label: '人才吸引力', type: 'select', options: [
          { label: '基础吸引', value: 0 }, { label: '中等吸引', value: 1 }, { label: '强力吸引', value: 2 }, { label: '全球顶尖', value: 3 }
        ], default: 0, unit: '' },
      ],
      indicators: [
        { id: 'patent_count', name: 'patent_count', label: '专利申请数', unit: '万件', format: 'number', higherIsBetter: true },
        { id: 'high_tech_output', name: 'high_tech_output', label: '高技术产业产值', unit: '亿元', format: 'currency', higherIsBetter: true },
        { id: 'rd_intensity', name: 'rd_intensity', label: '研发投入强度(R&D/GDP)', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'talent_inflow', name: 'talent_inflow', label: '高端人才净流入', unit: '万人', format: 'number', higherIsBetter: true },
        { id: 'tech_innovation_index', name: 'tech_innovation_index', label: '综合科技创新指数', unit: '', format: 'number', higherIsBetter: true },
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
        { id: 'response_time', name: 'response_time', label: '应急响应时间', type: 'slider', min: 0.5, max: 24, step: 0.5, default: 6, unit: '小时' },
        { id: 'rescue_teams', name: 'rescue_teams', label: '救援队伍数量', type: 'slider', min: 5, max: 100, step: 5, default: 30, unit: '支' },
        { id: 'evacuation_radius', name: 'evacuation_radius', label: '疏散半径', type: 'slider', min: 1, max: 20, step: 1, default: 5, unit: '公里' },
        { id: 'supply_reserve', name: 'supply_reserve', label: '应急物资储备', type: 'slider', min: 10, max: 100, step: 5, default: 40, unit: '%' },
        { id: 'comm_strategy', name: 'comm_strategy', label: '危机沟通策略', type: 'select', options: [
          { label: '内部通报', value: 0 }, { label: '有限公开', value: 1 }, { label: '实时公开', value: 2 }, { label: '多维全公开', value: 3 }
        ], default: 1, unit: '' },
      ],
      indicators: [
        { id: 'casualties', name: 'casualties', label: '预计伤亡人数', unit: '人', format: 'number', higherIsBetter: false },
        { id: 'econ_loss', name: 'econ_loss', label: '经济损失', unit: '亿元', format: 'currency', higherIsBetter: false },
        { id: 'rescue_efficiency', name: 'rescue_efficiency', label: '救援效率', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'public_trust', name: 'public_trust', label: '公众信任度', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'infra_damage', name: 'infra_damage', label: '基础设施损坏', unit: '%', format: 'percent', higherIsBetter: false },
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
        { id: 'sensor_density', name: 'sensor_density', label: '传感器覆盖率', type: 'slider', min: 10, max: 100, step: 5, default: 40, unit: '%' },
        { id: 'ai_investment', name: 'ai_investment', label: 'AI分析技术投入', type: 'slider', min: 10, max: 100, step: 5, default: 40, unit: '%' },
        { id: 'traffic_optimization', name: 'traffic_optimization', label: '交通优化力度', type: 'slider', min: 0, max: 100, step: 5, default: 40, unit: '%' },
        { id: 'smart_grid', name: 'smart_grid', label: '智能电网覆盖率', type: 'slider', min: 10, max: 100, step: 5, default: 40, unit: '%' },
        { id: 'data_openness', name: 'data_openness', label: '数据开放程度', type: 'select', options: [
          { label: '封闭', value: 0 }, { label: '有限开放', value: 1 }, { label: '政府内部共享', value: 2 }, { label: '全面开放+API', value: 3 }
        ], default: 1, unit: '' },
      ],
      indicators: [
        { id: 'traffic_efficiency', name: 'traffic_efficiency', label: '交通通行效率', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'energy_savings', name: 'energy_savings', label: '能源节约率', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'env_index', name: 'env_index', label: '城市环境指数', unit: '', format: 'number', higherIsBetter: true },
        { id: 'gov_efficiency', name: 'gov_efficiency', label: '政府服务效率', unit: '%', format: 'percent', higherIsBetter: true },
        { id: 'digital_life', name: 'digital_life', label: '居民数字化生活指数', unit: '', format: 'number', higherIsBetter: true },
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
