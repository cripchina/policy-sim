import 'reflect-metadata';
import { createConnection } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './users/user.entity';
import { PolicyCase } from './cases/case.entity';

/**
 * Create case config JSON for a "税收政策调整" (Tax Policy) case
 */
function taxPolicyCase() {
  return {
    parameters: [
      { id: 'vat_rate', name: 'vat_rate', label: '增值税率', type: 'slider', min: 5, max: 25, step: 0.5, default: 13, unit: '%' },
      { id: 'corp_tax_rate', name: 'corp_tax_rate', label: '企业所得税率', type: 'slider', min: 10, max: 35, step: 1, default: 25, unit: '%' },
      { id: 'small_tax_break', name: 'small_tax_break', label: '小微企业减免力度', type: 'slider', min: 0, max: 100, step: 5, default: 50, unit: '%' },
      { id: 'tax_zone', name: 'tax_zone', label: '税收优惠区政策', type: 'select', options: [
        { label: '无优惠区', value: 0 },
        { label: '普通优惠区', value: 1 },
        { label: '重点优惠区', value: 2 },
        { label: '特区政策', value: 3 },
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
      { indicatorId: 'business_investment', expression: '100 - 1.5 * (params.corp_tax_rate - 15) + 0.5 * params.small_tax_break + 5 * params.tax_zone - 0.3 * params.vat_rate + (Math.cos(params.corp_tax_rate * 0.1) * 2)' },
      { indicatorId: 'employment', expression: '95 + 0.08 * params.small_tax_break - 0.2 * (params.vat_rate - 10) + 0.5 * params.tax_zone + (Math.random() * 0.5)' },
      { indicatorId: 'consumer_price', expression: '102 + 0.15 * (params.vat_rate - 10) - 0.1 * params.small_tax_break - 0.2 * params.tax_zone + (Math.sin(params.vat_rate * 0.3) * 0.5)' },
    ],
  };
}

/**
 * "环境规制政策" (Environmental Regulation) case
 */
function environmentCase() {
  return {
    parameters: [
      { id: 'emission_standard', name: 'emission_standard', label: '排放标准严格度', type: 'slider', min: 1, max: 10, step: 0.5, default: 5, unit: '级' },
      { id: 'pollution_tax', name: 'pollution_tax', label: '污染税税率', type: 'slider', min: 0, max: 500, step: 10, default: 100, unit: '元/吨' },
      { id: 'green_subsidy', name: 'green_subsidy', label: '绿色技术补贴', type: 'slider', min: 0, max: 200, step: 10, default: 50, unit: '亿元' },
      { id: 'enforce_strictness', name: 'enforce_strictness', label: '执法严格度', type: 'select', options: [
        { label: '宽松', value: 0 },
        { label: '一般', value: 1 },
        { label: '严格', value: 2 },
        { label: '极严', value: 3 },
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
      { indicatorId: 'env_revenue', expression: '200 + params.pollution_tax * 0.5 + 30 * params.enforce_strictness - params.green_subsidy * 0.1 + (Math.sin(params.pollution_tax * 0.01) * 10)' },
      { indicatorId: 'public_satisfaction', expression: '60 + 4 * params.emission_standard + 0.1 * params.green_subsidy + 3 * params.enforce_strictness - 0.02 * params.pollution_tax + (Math.cos(params.emission_standard * 0.3) * 2)' },
    ],
  };
}

/**
 * "社会保障支出" (Social Welfare) case
 */
function welfareCase() {
  return {
    parameters: [
      { id: 'welfare_spending', name: 'welfare_spending', label: '社会保障支出', type: 'slider', min: 100, max: 2000, step: 50, default: 500, unit: '亿元' },
      { id: 'min_wage', name: 'min_wage', label: '最低工资标准', type: 'slider', min: 2000, max: 6000, step: 100, default: 3000, unit: '元/月' },
      { id: 'unemployment_benefit', name: 'unemployment_benefit', label: '失业金替代率', type: 'slider', min: 20, max: 80, step: 5, default: 40, unit: '%' },
      { id: 'healthcare_coverage', name: 'healthcare_coverage', label: '医疗保障覆盖率', type: 'select', options: [
        { label: '基础覆盖(60%)', value: 60 },
        { label: '中等覆盖(75%)', value: 75 },
        { label: '全面覆盖(90%)', value: 90 },
        { label: '全民免费(100%)', value: 100 },
      ], default: 75, unit: '%' },
    ],
    indicators: [
      { id: 'poverty_rate', name: 'poverty_rate', label: '贫困率', unit: '%', format: 'percent', higherIsBetter: false },
      { id: 'fiscal_deficit', name: 'fiscal_deficit', label: '财政赤字率', unit: '%', format: 'percent', higherIsBetter: false },
      { id: 'life_expectancy', name: 'life_expectancy', label: '人均预期寿命', unit: '岁', format: 'number', higherIsBetter: true },
      { id: 'social_stability', name: 'social_stability', label: '社会稳定指数', unit: '', format: 'number', higherIsBetter: true },
      { id: 'labor_participation', name: 'labor_participation', label: '劳动力参与率', unit: '%', format: 'percent', higherIsBetter: true },
    ],
    formulas: [
      { indicatorId: 'poverty_rate', expression: '15 - 0.005 * params.welfare_spending - 0.001 * params.min_wage - 0.05 * params.unemployment_benefit - 0.05 * params.healthcare_coverage + 5 + (Math.sin(params.welfare_spending * 0.002) * 0.5)' },
      { indicatorId: 'fiscal_deficit', expression: '3 + 0.002 * params.welfare_spending + 0.0003 * params.min_wage + 0.01 * params.unemployment_benefit + 0.02 * params.healthcare_coverage - 1.5 + (Math.cos(params.welfare_spending * 0.001) * 0.3)' },
      { indicatorId: 'life_expectancy', expression: '76 + 0.001 * params.welfare_spending + 0.0002 * params.min_wage + 0.03 * params.healthcare_coverage + (Math.sin(params.welfare_spending * 0.003) * 0.2)' },
      { indicatorId: 'social_stability', expression: '50 + 0.02 * params.welfare_spending - 0.5 * (params.unemployment_benefit > 60 ? params.unemployment_benefit - 60 : 0) + 0.2 * params.healthcare_coverage + (Math.sin(params.welfare_spending * 0.003) * 2)' },
      { indicatorId: 'labor_participation', expression: '65 + 0.002 * params.min_wage - 0.05 * params.unemployment_benefit + 0.01 * params.healthcare_coverage - params.poverty_rate * 0.3 + (Math.cos(params.min_wage * 0.0005) * 1)' },
    ],
  };
}

/**
 * "房地产调控政策" (Housing Policy) case
 */
function housingCase() {
  return {
    parameters: [
      { id: 'property_tax', name: 'property_tax', label: '房产税税率', type: 'slider', min: 0, max: 5, step: 0.1, default: 1, unit: '%' },
      { id: 'land_supply', name: 'land_supply', label: '住宅用地供应', type: 'slider', min: 100, max: 2000, step: 50, default: 500, unit: '公顷' },
      { id: 'mortgage_rate', name: 'mortgage_rate', label: '房贷利率', type: 'slider', min: 2, max: 8, step: 0.25, default: 4.5, unit: '%' },
      { id: 'purchase_restriction', name: 'purchase_restriction', label: '限购政策强度', type: 'select', options: [
        { label: '无限购', value: 0 },
        { label: '温和限购', value: 1 },
        { label: '严格限购', value: 2 },
        { label: '极严限购', value: 3 },
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
      { indicatorId: 'affordability', expression: '40 + 5 * params.property_tax + 0.02 * params.land_supply - 3 * params.mortgage_rate + 8 * params.purchase_restriction + (Math.cos(params.property_tax * 0.8) * 2)' },
      { indicatorId: 'construction_employment', expression: '500 + 0.05 * params.land_supply - 10 * params.property_tax - 20 * params.mortgage_rate + 15 * params.purchase_restriction + (Math.sin(params.land_supply * 0.003) * 10)' },
    ],
  };
}

/**
 * "科技创新激励政策" (Innovation Incentives) case
 */
function innovationCase() {
  return {
    parameters: [
      { id: 'rd_subsidy', name: 'rd_subsidy', label: '研发补贴力度', type: 'slider', min: 0, max: 500, step: 10, default: 100, unit: '亿元' },
      { id: 'patent_protection', name: 'patent_protection', label: '知识产权保护强度', type: 'slider', min: 1, max: 10, step: 0.5, default: 5, unit: '级' },
      { id: 'edu_investment', name: 'edu_investment', label: '教育投入', type: 'slider', min: 2000, max: 10000, step: 100, default: 4000, unit: '亿元' },
      { id: 'talent_attraction', name: 'talent_attraction', label: '人才引进力度', type: 'select', options: [
        { label: '基础政策', value: 0 },
        { label: '中等力度', value: 1 },
        { label: '强力引进', value: 2 },
        { label: '全球引才', value: 3 },
      ], default: 0, unit: '' },
    ],
    indicators: [
      { id: 'patent_count', name: 'patent_count', label: '专利申请量', unit: '万件', format: 'number', higherIsBetter: true },
      { id: 'high_tech_output', name: 'high_tech_output', label: '高技术产业产值', unit: '亿元', format: 'currency', higherIsBetter: true },
      { id: 'rd_intensity', name: 'rd_intensity', label: '研发投入强度(R&D/GDP)', unit: '%', format: 'percent', higherIsBetter: true },
      { id: 'talent_inflow', name: 'talent_inflow', label: '高端人才净流入', unit: '万人', format: 'number', higherIsBetter: true },
      { id: 'tech_innovation_index', name: 'tech_innovation_index', label: '综合科技创新指数', unit: '', format: 'number', higherIsBetter: true },
    ],
    formulas: [
      { indicatorId: 'patent_count', expression: '50 + 0.2 * params.rd_subsidy + 5 * params.patent_protection + 0.005 * params.edu_investment + 10 * params.talent_attraction + (Math.sin(params.rd_subsidy * 0.01) * 3)' },
      { indicatorId: 'high_tech_output', expression: '15000 + 30 * params.rd_subsidy + 500 * params.patent_protection + 2 * params.edu_investment + 1000 * params.talent_attraction + (Math.cos(params.rd_subsidy * 0.005) * 200)' },
      { indicatorId: 'rd_intensity', expression: '2.0 + 0.005 * params.rd_subsidy + 0.1 * params.patent_protection + 0.0002 * params.edu_investment + 0.2 * params.talent_attraction + (Math.random() * 0.1)' },
      { indicatorId: 'talent_inflow', expression: '5 + 0.03 * params.rd_subsidy + 0.8 * params.patent_protection + 0.002 * params.edu_investment + 5 * params.talent_attraction + (Math.sin(params.talent_attraction * 0.5) * 1)' },
      { indicatorId: 'tech_innovation_index', expression: '60 + 0.06 * params.rd_subsidy + 3 * params.patent_protection + 0.004 * params.edu_investment + 5 * params.talent_attraction + (Math.cos(params.rd_subsidy * 0.008) * 2)' },
    ],
  };
}

async function seed() {
  const connection = await createConnection({
    type: 'sqljs',
    location: './data/policysim.db',
    autoSave: true,
    entities: [User, PolicyCase],
    synchronize: true,
  });

  const userRepo = connection.getRepository(User);
  const caseRepo = connection.getRepository(PolicyCase);

  // Clear existing data
  await caseRepo.clear();
  await userRepo.clear();

  // Create users
  const hashedPwd = await bcrypt.hash('123456', 10);
  const users = await userRepo.save([
    { username: 'admin', password: hashedPwd, displayName: '系统管理员', role: UserRole.ADMIN },
    { username: 'teacher1', password: hashedPwd, displayName: '张教授', role: UserRole.TEACHER },
    { username: 'teacher2', password: hashedPwd, displayName: '李老师', role: UserRole.TEACHER },
    { username: 'student1', password: hashedPwd, displayName: '王同学', role: UserRole.STUDENT },
    { username: 'student2', password: hashedPwd, displayName: '刘同学', role: UserRole.STUDENT },
    { username: 'student3', password: hashedPwd, displayName: '陈同学', role: UserRole.STUDENT },
  ]);
  console.log(`Created ${users.length} users`);

  // Create cases
  const cases = await caseRepo.save([
    {
      title: '税收政策调整对宏观经济的影响',
      description: '模拟调整增值税率、企业所得税率等税收工具，观察对GDP、就业、收入分配等宏观经济指标的影响。',
      category: '财政税收',
      background: `## 案例背景\n\n税收政策是国家宏观调控的重要工具。当前我国经济面临下行压力，如何通过税收政策调整来"稳增长、调结构、惠民生"是政府面临的关键课题。\n\n本案例中，你将扮演政策制定者的角色，通过调整增值税率、企业所得税率、小微企业税收减免力度以及税收优惠区政策，观察这些政策工具对GDP增长率、政府财政收入、基尼系数、企业投资指数、就业率和消费者价格指数的影响。\n\n### 学习目标\n1. 理解不同税收工具对宏观经济的影响机制\n2. 掌握政策目标之间的权衡与取舍\n3. 培养基于数据的政策决策能力`,
      config: JSON.stringify(taxPolicyCase()),
    },
    {
      title: '环境规制政策与经济发展的平衡',
      description: '探索排放标准、污染税、绿色补贴等环境政策工具，如何在改善环境质量的同时促进产业升级和就业。',
      category: '环境政策',
      background: `## 案例背景\n\n经济发展与环境保护之间的平衡是可持续发展的核心挑战。随着"双碳"目标的推进，各级政府面临着如何在严格环境规制下保持经济健康发展的难题。\n\n本案例中，你将调整排放标准严格度、污染税税率、绿色技术补贴和执法严格度等政策杠杆，观察它们对空气质量、工业产出、绿色就业、环境税收入和公众满意度的影响。\n\n### 学习目标\n1. 理解环境规制的经济效应\n2. 分析绿色创新对产业升级的推动作用\n3. 掌握环境政策的多目标优化方法`,
      config: JSON.stringify(environmentCase()),
    },
    {
      title: '社会保障支出与民生改善',
      description: '调整社会保障支出、最低工资、失业金替代率和医疗保障覆盖面，评估对贫困率、社会稳定和财政可持续性的综合影响。',
      category: '社会保障',
      background: `## 案例背景\n\n完善的社会保障体系是民生福祉的重要保障。随着人口老龄化加剧和经济增速放缓，如何在有限的财政资源下最大化社会保障的效益，是各国政府面临的共同挑战。\n\n本案例中，你将调整社会保障支出总额、最低工资标准、失业金替代率和医疗保障覆盖率，观察这些政策对贫困率、财政赤字率、人均预期寿命、社会稳定指数和劳动力参与率的影响。\n\n### 学习目标\n1. 理解社会保障支出与财政可持续性的关系\n2. 分析福利制度对劳动力市场的影响\n3. 掌握社会政策评估的多维度分析方法`,
      config: JSON.stringify(welfareCase()),
    },
    {
      title: '房地产调控政策与市场稳定',
      description: '运用房产税、土地供应、房贷利率和限购政策等工具，实现"房住不炒"目标，促进房地产市场健康发展。',
      category: '住房政策',
      background: `## 案例背景\n\n房地产市场的平稳健康发展关系到国民经济全局和人民群众的切身利益。近年来，我国坚持"房住不炒"定位，但因城施策的调控力度和工具选择仍需精准把握。\n\n本案例中，你将调整房产税税率、住宅用地供应量、房贷利率和限购政策强度，观察这些工具对房价指数、住房空置率、土地出让收入、居民购房能力指数和建筑业就业的影响。\n\n### 学习目标\n1. 理解房地产市场调控的政策工具箱\n2. 分析不同调控政策的短期与长期效应\n3. 掌握住房政策的多目标权衡方法`,
      config: JSON.stringify(housingCase()),
    },
    {
      title: '科技创新激励政策与产业升级',
      description: '通过研发补贴、知识产权保护、教育投入和人才引进政策，推动科技创新和产业结构升级。',
      category: '科技政策',
      background: `## 案例背景\n\n科技创新是引领发展的第一动力。在激烈的国际科技竞争背景下，如何通过有效的政策组合激发创新活力、促进产业升级，是各国科技政策的核心议题。\n\n本案例中，你将调整研发补贴力度、知识产权保护强度、教育投入和人才引进力度，观察它们对专利申请量、高技术产业产值、研发投入强度、高端人才净流入和综合科技创新指数的影响。\n\n### 学习目标\n1. 理解创新驱动发展的政策路径\n2. 分析知识产权保护与技术创新之间的关系\n3. 掌握科技政策评估的指标体系`,
      config: JSON.stringify(innovationCase()),
    },
  ]);
  console.log(`Created ${cases.length} policy cases`);

  // Fix education investment parameter - remove the GDP function reference
  // Actually let's leave it as a simple slider
  console.log('Seed completed successfully!');
  await connection.close();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
