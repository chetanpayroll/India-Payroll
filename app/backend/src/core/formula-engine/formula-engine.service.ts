import { Injectable, BadRequestException } from '@nestjs/common';
import { Parser } from 'expr-eval';

export interface FormulaContext {
    elements: Record<string, number>;
    employee: {
        basic?: number;
        gross?: number;
        ctc?: number;
        [key: string]: any;
    };
    payroll: {
        working_days: number;
        paid_days: number;
        lop_days: number;
        gross?: number;
        [key: string]: any;
    };
    statutory: {
        epf_ceiling: number;
        esi_ceiling: number;
        [key: string]: any;
    };
}

@Injectable()
export class FormulaEngineService {
    private parser: Parser;

    constructor() {
        this.parser = new Parser();
        this.registerHelperFunctions();
    }

    /**
     * Register custom helper functions
     */
    private registerHelperFunctions() {
        // Math functions
        this.parser.functions.min = Math.min;
        this.parser.functions.max = Math.max;
        this.parser.functions.round = (value: number, decimals = 0) => {
            const factor = Math.pow(10, decimals);
            return Math.round(value * factor) / factor;
        };
        this.parser.functions.floor = Math.floor;
        this.parser.functions.ceil = Math.ceil;
        this.parser.functions.abs = Math.abs;

        // Custom functions
        this.parser.functions.if_else = (condition: boolean, trueValue: number, falseValue: number) => {
            return condition ? trueValue : falseValue;
        };

        this.parser.functions.prorate = (amount: number, paidDays: number, totalDays: number) => {
            if (totalDays === 0) return 0;
            return Math.round((amount * paidDays) / totalDays);
        };

        this.parser.functions.percentage = (base: number, percentage: number) => {
            return Math.round((base * percentage) / 100);
        };
    }

    /**
     * Evaluate a formula expression
     */
    evaluate(expression: string, context: FormulaContext): number {
        try {
            const result = this.parser.parse(expression).evaluate(context);

            if (typeof result !== 'number' || isNaN(result)) {
                throw new Error(`Formula evaluation returned non-numeric result: ${result}`);
            }

            return result;
        } catch (error) {
            throw new BadRequestException(`Formula evaluation error: ${error.message}`);
        }
    }

    /**
     * Validate formula syntax
     */
    validate(expression: string): { valid: boolean; error?: string } {
        try {
            this.parser.parse(expression);
            return { valid: true };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    /**
     * Extract dependencies from formula
     */
    extractDependencies(expression: string): string[] {
        try {
            const parsed = this.parser.parse(expression);
            const variables = parsed.variables();

            // Extract element dependencies (e.g., "elements.basic" -> "basic")
            const dependencies = variables
                .filter((v) => v.startsWith('elements.'))
                .map((v) => v.replace('elements.', ''));

            return [...new Set(dependencies)];
        } catch (error) {
            return [];
        }
    }

    /**
     * Topological sort for dependency resolution
     */
    topologicalSort(dependencyGraph: Map<string, string[]>): string[] {
        const visited = new Set<string>();
        const visiting = new Set<string>();
        const result: string[] = [];

        const visit = (node: string, path: string[] = []) => {
            if (visiting.has(node)) {
                const cycle = [...path, node];
                throw new BadRequestException(
                    `Circular dependency detected: ${cycle.join(' → ')}`,
                );
            }

            if (visited.has(node)) {
                return;
            }

            visiting.add(node);
            const dependencies = dependencyGraph.get(node) || [];

            for (const dependency of dependencies) {
                if (dependencyGraph.has(dependency)) {
                    visit(dependency, [...path, node]);
                }
            }

            visiting.delete(node);
            visited.add(node);
            result.push(node);
        };

        // Visit all nodes
        for (const node of dependencyGraph.keys()) {
            if (!visited.has(node)) {
                visit(node);
            }
        }

        return result;
    }

    /**
     * Test formula with sample context
     */
    test(expression: string, sampleContext?: Partial<FormulaContext>): number {
        const defaultContext: FormulaContext = {
            elements: {},
            employee: {
                basic: 50000,
                gross: 75000,
                ctc: 1000000,
            },
            payroll: {
                working_days: 26,
                paid_days: 26,
                lop_days: 0,
                gross: 75000,
            },
            statutory: {
                epf_ceiling: 15000,
                esi_ceiling: 21000,
            },
        };

        const context = {
            ...defaultContext,
            ...sampleContext,
            elements: {
                ...defaultContext.elements,
                ...(sampleContext?.elements || {}),
            },
            employee: {
                ...defaultContext.employee,
                ...(sampleContext?.employee || {}),
            },
            payroll: {
                ...defaultContext.payroll,
                ...(sampleContext?.payroll || {}),
            },
            statutory: {
                ...defaultContext.statutory,
                ...(sampleContext?.statutory || {}),
            },
        };

        return this.evaluate(expression, context);
    }
}
