/**
 * Payroll Elements Service
 * Enterprise-grade service for managing country-specific payroll elements
 * with compliance rules, calculation engine, and validation
 */

import { PrismaClient, SalaryElement, ElementType, ElementCategory, CalculationMethod, RuleType } from '@prisma/client'

const prisma = new PrismaClient()

export interface PayrollElementInput {
  name: string
  nameArabic?: string
  code: string
  type: ElementType
  category: ElementCategory
  isRecurring?: boolean
  isTaxable?: boolean
  calculationMethod?: CalculationMethod
  percentageOf?: string
  percentage?: number
  defaultAmount?: number
  description?: string
  countryCode?: string
  isStatutory?: boolean
  isSystemDefined?: boolean
  isActive?: boolean
  displayOrder?: number
  showInPayslip?: boolean
}

export interface PayrollElementRuleInput {
  elementId: string
  ruleName: string
  ruleType: RuleType
  conditions?: any
  formula: any
  countryCode?: string
  state?: string
  effectiveFrom: Date
  effectiveTo?: Date
  priority?: number
  isActive?: boolean
  description?: string
}

export interface ComplianceMappingInput {
  elementId: string
  countryCode: string
  complianceAuthority: string
  reportingCode?: string
  reportingCategory?: string
  calculationReference?: string
  wageceiling?: number
  minAmount?: number
  maxAmount?: number
  applicabilityCriteria?: any
  effectiveFrom: Date
  effectiveTo?: Date
  notes?: string
}

export interface CalculationContext {
  employeeData: any
  salaryComponents: Record<string, number>
  periodDays?: number
  presentDays?: number
  countryCode: string
  state?: string
  calculationDate?: Date
}

export class PayrollElementsService {

  /**
   * Get all payroll elements with optional filtering
   */
  async getAllElements(filters?: {
    countryCode?: string
    type?: ElementType
    category?: ElementCategory
    isActive?: boolean
    isStatutory?: boolean
    isRecurring?: boolean
  }) {
    const where: any = {}

    if (filters?.countryCode !== undefined) {
      where.OR = [
        { countryCode: filters.countryCode },
        { countryCode: null } // Include global elements
      ]
    }
    if (filters?.type) where.type = filters.type
    if (filters?.category) where.category = filters.category
    if (filters?.isActive !== undefined) where.isActive = filters.isActive
    if (filters?.isStatutory !== undefined) where.isStatutory = filters.isStatutory
    if (filters?.isRecurring !== undefined) where.isRecurring = filters.isRecurring

    return await prisma.salaryElement.findMany({
      where,
      include: {
        rules: {
          where: { isActive: true },
          orderBy: { priority: 'desc' }
        },
        complianceMappings: {
          where: { isActive: true }
        }
      },
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' }
      ]
    })
  }

  /**
   * Get element by ID
   */
  async getElementById(id: string) {
    return await prisma.salaryElement.findUnique({
      where: { id },
      include: {
        rules: {
          orderBy: { priority: 'desc' }
        },
        complianceMappings: true
      }
    })
  }

  /**
   * Get element by code
   */
  async getElementByCode(code: string) {
    return await prisma.salaryElement.findUnique({
      where: { code },
      include: {
        rules: {
          where: { isActive: true },
          orderBy: { priority: 'desc' }
        },
        complianceMappings: {
          where: { isActive: true }
        }
      }
    })
  }

  /**
   * Create a new payroll element
   */
  async createElement(input: PayrollElementInput) {
    // Validate unique code
    const existing = await prisma.salaryElement.findUnique({
      where: { code: input.code }
    })

    if (existing) {
      throw new Error(`Element with code '${input.code}' already exists`)
    }

    return await prisma.salaryElement.create({
      data: {
        name: input.name,
        nameArabic: input.nameArabic,
        code: input.code,
        type: input.type,
        category: input.category,
        isRecurring: input.isRecurring ?? true,
        isTaxable: input.isTaxable ?? true,
        calculationMethod: input.calculationMethod ?? CalculationMethod.FIXED,
        percentageOf: input.percentageOf,
        percentage: input.percentage,
        defaultAmount: input.defaultAmount,
        description: input.description,
        countryCode: input.countryCode,
        isStatutory: input.isStatutory ?? false,
        isSystemDefined: input.isSystemDefined ?? false,
        isActive: input.isActive ?? true,
        displayOrder: input.displayOrder ?? 0,
        showInPayslip: input.showInPayslip ?? true
      }
    })
  }

  /**
   * Update an existing payroll element
   */
  async updateElement(id: string, input: Partial<PayrollElementInput>) {
    const element = await prisma.salaryElement.findUnique({ where: { id } })

    if (!element) {
      throw new Error(`Element with ID '${id}' not found`)
    }

    // Prevent modification of system-defined elements
    if (element.isSystemDefined && input.isSystemDefined === false) {
      throw new Error('Cannot modify system-defined elements')
    }

    // Check code uniqueness if updating code
    if (input.code && input.code !== element.code) {
      const existing = await prisma.salaryElement.findUnique({
        where: { code: input.code }
      })
      if (existing) {
        throw new Error(`Element with code '${input.code}' already exists`)
      }
    }

    return await prisma.salaryElement.update({
      where: { id },
      data: input
    })
  }

  /**
   * Delete a payroll element
   */
  async deleteElement(id: string) {
    const element = await prisma.salaryElement.findUnique({ where: { id } })

    if (!element) {
      throw new Error(`Element with ID '${id}' not found`)
    }

    if (element.isSystemDefined) {
      throw new Error('Cannot delete system-defined elements')
    }

    // Check if element is assigned to any employees
    const assignments = await prisma.employeeSalaryElement.count({
      where: { elementId: id, isActive: true }
    })

    if (assignments > 0) {
      throw new Error(`Cannot delete element: It is assigned to ${assignments} employee(s)`)
    }

    return await prisma.salaryElement.delete({ where: { id } })
  }

  /**
   * Soft delete (deactivate) an element
   */
  async deactivateElement(id: string) {
    return await prisma.salaryElement.update({
      where: { id },
      data: { isActive: false }
    })
  }

  // ==================== CALCULATION RULES ====================

  /**
   * Add calculation rule to an element
   */
  async addRule(input: PayrollElementRuleInput) {
    const element = await prisma.salaryElement.findUnique({
      where: { id: input.elementId }
    })

    if (!element) {
      throw new Error('Element not found')
    }

    return await prisma.payrollElementRule.create({
      data: {
        elementId: input.elementId,
        ruleName: input.ruleName,
        ruleType: input.ruleType,
        conditions: input.conditions,
        formula: input.formula,
        countryCode: input.countryCode,
        state: input.state,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo,
        priority: input.priority ?? 0,
        isActive: input.isActive ?? true,
        description: input.description
      }
    })
  }

  /**
   * Update a calculation rule
   */
  async updateRule(ruleId: string, input: Partial<PayrollElementRuleInput>) {
    return await prisma.payrollElementRule.update({
      where: { id: ruleId },
      data: input
    })
  }

  /**
   * Delete a calculation rule
   */
  async deleteRule(ruleId: string) {
    return await prisma.payrollElementRule.delete({
      where: { id: ruleId }
    })
  }

  /**
   * Get all rules for an element
   */
  async getElementRules(elementId: string) {
    return await prisma.payrollElementRule.findMany({
      where: { elementId },
      orderBy: { priority: 'desc' }
    })
  }

  // ==================== COMPLIANCE MAPPINGS ====================

  /**
   * Add compliance mapping
   */
  async addComplianceMapping(input: ComplianceMappingInput) {
    return await prisma.payrollElementComplianceMapping.create({
      data: {
        elementId: input.elementId,
        countryCode: input.countryCode,
        complianceAuthority: input.complianceAuthority,
        reportingCode: input.reportingCode,
        reportingCategory: input.reportingCategory,
        calculationReference: input.calculationReference,
        wageceiling: input.wageceiling,
        minAmount: input.minAmount,
        maxAmount: input.maxAmount,
        applicabilityCriteria: input.applicabilityCriteria,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo,
        isActive: true,
        notes: input.notes
      }
    })
  }

  /**
   * Get compliance mappings for an element
   */
  async getComplianceMappings(elementId: string, countryCode?: string) {
    const where: any = { elementId }
    if (countryCode) {
      where.countryCode = countryCode
    }

    return await prisma.payrollElementComplianceMapping.findMany({
      where,
      include: {
        element: true
      }
    })
  }

  /**
   * Get all statutory elements for a country
   */
  async getStatutoryElements(countryCode: string) {
    return await prisma.salaryElement.findMany({
      where: {
        isStatutory: true,
        isActive: true,
        OR: [
          { countryCode },
          { countryCode: null }
        ]
      },
      include: {
        rules: {
          where: { isActive: true, countryCode },
          orderBy: { priority: 'desc' }
        },
        complianceMappings: {
          where: { isActive: true, countryCode }
        }
      }
    })
  }

  // ==================== CALCULATION ENGINE ====================

  /**
   * Calculate element amount based on rules
   */
  async calculateElementAmount(
    elementCode: string,
    context: CalculationContext
  ): Promise<number> {
    const element = await this.getElementByCode(elementCode)

    if (!element) {
      throw new Error(`Element '${elementCode}' not found`)
    }

    if (!element.isActive) {
      return 0
    }

    // Get applicable rules
    const applicableRules = this.getApplicableRules(element, context)

    if (applicableRules.length > 0) {
      // Use the highest priority rule
      const rule = applicableRules[0]
      return this.executeRule(rule, context)
    }

    // Fallback to basic calculation method
    return this.calculateBasic(element, context)
  }

  /**
   * Get applicable rules based on context
   */
  private getApplicableRules(element: any, context: CalculationContext) {
    if (!element.rules || element.rules.length === 0) {
      return []
    }

    const calculationDate = context.calculationDate || new Date()

    return element.rules.filter((rule: any) => {
      // Check if rule is active
      if (!rule.isActive) return false

      // Check effective dates
      if (rule.effectiveFrom > calculationDate) return false
      if (rule.effectiveTo && rule.effectiveTo < calculationDate) return false

      // Check country
      if (rule.countryCode && rule.countryCode !== context.countryCode) return false

      // Check state (for India PT)
      if (rule.state && rule.state !== context.state) return false

      // Check conditions
      if (rule.conditions) {
        return this.evaluateConditions(rule.conditions, context)
      }

      return true
    })
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateConditions(conditions: any, context: CalculationContext): boolean {
    if (typeof conditions !== 'object') return true

    const { field, operator, value } = conditions

    if (!field || !operator) return true

    const fieldValue = this.getFieldValue(field, context)

    switch (operator) {
      case '>': return fieldValue > value
      case '>=': return fieldValue >= value
      case '<': return fieldValue < value
      case '<=': return fieldValue <= value
      case '==': return fieldValue == value
      case '!=': return fieldValue != value
      case 'in': return Array.isArray(value) && value.includes(fieldValue)
      default: return true
    }
  }

  /**
   * Get field value from context
   */
  private getFieldValue(field: string, context: CalculationContext): any {
    // Check salary components first
    if (context.salaryComponents[field] !== undefined) {
      return context.salaryComponents[field]
    }

    // Check employee data
    if (context.employeeData[field] !== undefined) {
      return context.employeeData[field]
    }

    // Special fields
    if (field === 'basic') return context.salaryComponents.basic || 0
    if (field === 'gross') {
      return Object.values(context.salaryComponents).reduce((sum, val) => sum + val, 0)
    }

    return 0
  }

  /**
   * Execute a calculation rule
   */
  private executeRule(rule: any, context: CalculationContext): number {
    const formula = rule.formula

    if (!formula) return 0

    try {
      let result = 0

      switch (rule.ruleType) {
        case 'STATUTORY_CALCULATION':
          result = this.calculateStatutory(formula, context)
          break

        case 'CONDITIONAL_FORMULA':
          result = this.calculateConditional(formula, context)
          break

        case 'TIERED_CALCULATION':
          result = this.calculateTiered(formula, context)
          break

        case 'ATTENDANCE_BASED':
          result = this.calculateAttendanceBased(formula, context)
          break

        case 'CUSTOM':
          result = this.evaluateCustomFormula(formula, context)
          break

        default:
          result = this.evaluateCustomFormula(formula, context)
      }

      // Apply min/max limits
      if (formula.min !== undefined) {
        result = Math.max(result, formula.min)
      }
      if (formula.max !== undefined) {
        result = Math.min(result, formula.max)
      }

      return Math.round(result * 100) / 100 // Round to 2 decimals
    } catch (error) {
      console.error('Error executing rule:', error)
      return 0
    }
  }

  /**
   * Calculate statutory amounts (PF, ESIC, GPSSA, etc.)
   */
  private calculateStatutory(formula: any, context: CalculationContext): number {
    const { baseField, rate, ceiling } = formula

    let baseAmount = this.getFieldValue(baseField || 'basic', context)

    // Apply wage ceiling if specified
    if (ceiling) {
      baseAmount = Math.min(baseAmount, ceiling)
    }

    return baseAmount * (rate || 0)
  }

  /**
   * Calculate conditional amounts
   */
  private calculateConditional(formula: any, context: CalculationContext): number {
    const { condition, ifTrue, ifFalse } = formula

    if (!condition) return 0

    const conditionMet = this.evaluateConditions(condition, context)

    if (conditionMet && ifTrue) {
      return this.evaluateCustomFormula(ifTrue, context)
    } else if (!conditionMet && ifFalse) {
      return this.evaluateCustomFormula(ifFalse, context)
    }

    return 0
  }

  /**
   * Calculate tiered/slab-based amounts (like PT, TDS)
   */
  private calculateTiered(formula: any, context: CalculationContext): number {
    const { baseField, slabs } = formula

    if (!slabs || !Array.isArray(slabs)) return 0

    const baseAmount = this.getFieldValue(baseField || 'gross', context)

    // Find applicable slab
    for (const slab of slabs) {
      const min = slab.min || 0
      const max = slab.max || Infinity

      if (baseAmount >= min && baseAmount <= max) {
        if (slab.rate) {
          return baseAmount * slab.rate
        } else if (slab.amount !== undefined) {
          return slab.amount
        }
      }
    }

    return 0
  }

  /**
   * Calculate attendance-based amounts
   */
  private calculateAttendanceBased(formula: any, context: CalculationContext): number {
    const { baseField, prorationMethod } = formula

    const baseAmount = this.getFieldValue(baseField || 'basic', context)
    const periodDays = context.periodDays || 30
    const presentDays = context.presentDays || periodDays

    if (prorationMethod === 'DAILY') {
      return (baseAmount / periodDays) * presentDays
    }

    return baseAmount
  }

  /**
   * Evaluate custom formula (safe math expression)
   */
  private evaluateCustomFormula(formula: any, context: CalculationContext): number {
    if (typeof formula === 'number') {
      return formula
    }

    if (typeof formula === 'string') {
      // Safe formula evaluation
      return this.safeEval(formula, context)
    }

    if (formula.formula) {
      return this.safeEval(formula.formula, context)
    }

    return 0
  }

  /**
   * Safe evaluation of mathematical expressions
   */
  private safeEval(expression: string, context: CalculationContext): number {
    try {
      // Replace variable names with values
      let processedExpression = expression

      // Replace salary component references
      Object.keys(context.salaryComponents).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g')
        processedExpression = processedExpression.replace(regex, String(context.salaryComponents[key]))
      })

      // Only allow safe mathematical operations
      const safeExpression = processedExpression.replace(/[^0-9+\-*/.()]/g, '')

      // Use Function constructor for safe evaluation (no access to global scope)
      const result = new Function(`return ${safeExpression}`)()

      return typeof result === 'number' && !isNaN(result) ? result : 0
    } catch (error) {
      console.error('Error evaluating formula:', error)
      return 0
    }
  }

  /**
   * Basic calculation without rules
   */
  private calculateBasic(element: any, context: CalculationContext): number {
    switch (element.calculationMethod) {
      case 'FIXED':
        return element.defaultAmount || 0

      case 'PERCENTAGE':
        if (element.percentageOf && element.percentage) {
          const baseAmount = this.getFieldValue(element.percentageOf, context)
          return baseAmount * (element.percentage / 100)
        }
        return 0

      case 'PRORATED':
        const amount = element.defaultAmount || 0
        const periodDays = context.periodDays || 30
        const presentDays = context.presentDays || periodDays
        return (amount / periodDays) * presentDays

      default:
        return element.defaultAmount || 0
    }
  }

  /**
   * Bulk calculate all elements for an employee
   */
  async calculateAllElements(
    employeeId: string,
    countryCode: string,
    calculationDate?: Date
  ): Promise<Record<string, number>> {
    // Get employee's salary structure
    const assignments = await prisma.employeeSalaryElement.findMany({
      where: {
        employeeId,
        isActive: true,
        effectiveFrom: { lte: calculationDate || new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: calculationDate || new Date() } }
        ]
      },
      include: {
        element: {
          include: {
            rules: {
              where: { isActive: true },
              orderBy: { priority: 'desc' }
            }
          }
        }
      }
    })

    const results: Record<string, number> = {}
    const salaryComponents: Record<string, number> = {}

    // First pass: calculate all amounts
    for (const assignment of assignments) {
      const element = assignment.element

      const context: CalculationContext = {
        employeeData: { employeeId },
        salaryComponents,
        countryCode,
        calculationDate
      }

      const amount = await this.calculateElementAmount(element.code, context)

      results[element.code] = amount
      salaryComponents[element.code] = amount
    }

    return results
  }
}

export const payrollElementsService = new PayrollElementsService()
