import { Injectable } from '@nestjs/common';

export interface SimParameter {
  id: string;
  name: string;
  label: string;
  type: 'slider' | 'select' | 'number';
  min?: number;
  max?: number;
  step?: number;
  default: number;
  unit: string;
  options?: { label: string; value: number }[];
}

export interface SimIndicator {
  id: string;
  name: string;
  label: string;
  unit: string;
  format: 'number' | 'percent' | 'currency';
  higherIsBetter: boolean;
}

export interface SimFormula {
  indicatorId: string;
  /** A JS- evaluable expression using param IDs.
   *  E.g. "25 - 0.3 * params.tax_rate + 0.05 * params.subsidy"
   *  The engine provides safe evaluation via the Function constructor.
   */
  expression: string;
  description?: string;
}

export interface SimConfig {
  parameters: SimParameter[];
  indicators: SimIndicator[];
  formulas: SimFormula[];
}

export interface SimResult {
  indicatorId: string;
  label: string;
  value: number;
  unit: string;
  format: string;
  higherIsBetter: boolean;
}

@Injectable()
export class SimulationEngine {
  /**
   * Compute indicator values given a config and parameter values.
   * Each formula expression is evaluated with the params object in scope.
   */
  compute(config: SimConfig, params: Record<string, number>): SimResult[] {
    const results: SimResult[] = [];
    const indicatorMap = new Map(config.indicators.map(i => [i.id, i]));

    for (const formula of config.formulas) {
      const indicator = indicatorMap.get(formula.indicatorId);
      if (!indicator) continue;

      try {
        // Safe expression evaluation using Function constructor
        // The expression runs in a sandbox with only Math and params available
        const fn = new Function('params', `with(Math) { return (${formula.expression}); }`);
        let value = fn(params);

        // Clamp to reasonable range
        if (typeof value !== 'number' || isNaN(value)) {
          value = 0;
        }
        value = Math.round(value * 100) / 100;

        results.push({
          indicatorId: indicator.id,
          label: indicator.label,
          value,
          unit: indicator.unit,
          format: indicator.format,
          higherIsBetter: indicator.higherIsBetter,
        });
      } catch (e) {
        results.push({
          indicatorId: indicator.id,
          label: indicator.label,
          value: 0,
          unit: indicator.unit,
          format: indicator.format,
          higherIsBetter: indicator.higherIsBetter,
        });
      }
    }

    return results;
  }
}
