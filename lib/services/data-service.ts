/**
 * UAE Payroll System - Data Service Layer
 * Provides all CRUD operations and business logic
 */

import {
  Employee,
  PayrollRun,
  PayrollItem,
  LeaveRequest,
  LeaveBalance,
  Loan,
  SalaryAdvance,
  Payslip,
  CompanySettings,
  PublicHoliday,
  GratuityCalculation,
} from '../types';
import { Collection, storage, StorageKeys } from '../storage';
import { generateId } from '../utils';

/**
 * Employee Service
 */
export class EmployeeService {
  private collection: Collection<Employee>;

  constructor() {
    this.collection = new Collection<Employee>(StorageKeys.EMPLOYEES, storage);
  }

  getAll(): Employee[] {
    return this.collection.getAll();
  }

  getById(id: string): Employee | undefined {
    return this.collection.getById(id);
  }

  getByEmployeeCode(code: string): Employee | undefined {
    return this.collection.find((emp) => emp.employeeCode === code);
  }

  getByDepartment(department: string): Employee[] {
    return this.collection.filter((emp) => emp.department === department);
  }

  getActive(): Employee[] {
    return this.collection.filter((emp) => emp.isActive && emp.employmentStatus === 'active');
  }

  getOnProbation(): Employee[] {
    return this.collection.filter((emp) => emp.employmentStatus === 'probation');
  }

  create(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Employee {
    const now = new Date().toISOString();
    const newEmployee: Employee = {
      ...employee,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    return this.collection.add(newEmployee);
  }

  update(id: string, updates: Partial<Employee>): Employee {
    return this.collection.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  delete(id: string): boolean {
    return this.collection.delete(id);
  }

  search(query: string): Employee[] {
    const lowerQuery = query.toLowerCase();
    return this.collection.filter(
      (emp) =>
        emp.firstName.toLowerCase().includes(lowerQuery) ||
        emp.lastName.toLowerCase().includes(lowerQuery) ||
        emp.employeeCode.toLowerCase().includes(lowerQuery) ||
        emp.email.toLowerCase().includes(lowerQuery) ||
        emp.department.toLowerCase().includes(lowerQuery)
    );
  }

  getExpiringDocuments(daysAhead: number = 90): Array<{
    employee: Employee;
    documentType: string;
    expiryDate: string;
    daysUntilExpiry: number;
  }> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    const expiring: Array<any> = [];

    this.getActive().forEach((emp) => {
      const docs = [
        { type: 'Passport', date: emp.passportExpiry },
      ];

      docs.forEach(({ type, date }) => {
        if (!date) return;
        const expiryDate = new Date(date);
        if (expiryDate <= futureDate && expiryDate >= today) {
          const daysUntilExpiry = Math.floor(
            (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          expiring.push({
            employee: emp,
            documentType: type,
            expiryDate: date,
            daysUntilExpiry,
          });
        }
      });
    });

    return expiring.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }

  getDepartments(): string[] {
    const depts = new Set(this.getAll().map((emp) => emp.department));
    return Array.from(depts).sort();
  }

  count(): number {
    return this.collection.count();
  }
}

/**
 * Payroll Service
 */
export class PayrollService {
  private runsCollection: Collection<PayrollRun>;
  private itemsCollection: Collection<PayrollItem>;

  constructor() {
    this.runsCollection = new Collection<PayrollRun>(StorageKeys.PAYROLL_RUNS, storage);
    this.itemsCollection = new Collection<PayrollItem>(StorageKeys.PAYROLL_ITEMS, storage);
  }

  // Payroll Run methods
  getAllRuns(): PayrollRun[] {
    return this.runsCollection.getAll().sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getRunById(id: string): PayrollRun | undefined {
    return this.runsCollection.getById(id);
  }

  getRunsByYear(year: number): PayrollRun[] {
    return this.runsCollection.filter((run) => run.payrollYear === year);
  }

  getRunByPeriod(year: number, month: number): PayrollRun | undefined {
    return this.runsCollection.find(
      (run) => run.payrollYear === year && run.payrollMonth === month
    );
  }

  createRun(run: Omit<PayrollRun, 'id' | 'createdAt' | 'updatedAt'>): PayrollRun {
    const now = new Date().toISOString();
    const newRun: PayrollRun = {
      ...run,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    return this.runsCollection.add(newRun);
  }

  updateRun(id: string, updates: Partial<PayrollRun>): PayrollRun {
    return this.runsCollection.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  deleteRun(id: string): boolean {
    // Delete associated payroll items
    const items = this.getItemsByRun(id);
    items.forEach((item) => this.itemsCollection.delete(item.id));

    return this.runsCollection.delete(id);
  }

  // Payroll Item methods
  getItemsByRun(runId: string): PayrollItem[] {
    return this.itemsCollection.filter((item) => item.payrollRunId === runId);
  }

  getItemById(id: string): PayrollItem | undefined {
    return this.itemsCollection.getById(id);
  }

  getItemsByEmployee(employeeId: string): PayrollItem[] {
    return this.itemsCollection.filter((item) => item.employeeId === employeeId);
  }

  createItem(item: Omit<PayrollItem, 'id' | 'createdAt' | 'updatedAt'>): PayrollItem {
    const now = new Date().toISOString();
    const newItem: PayrollItem = {
      ...item,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    return this.itemsCollection.add(newItem);
  }

  updateItem(id: string, updates: Partial<PayrollItem>): PayrollItem {
    return this.itemsCollection.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  deleteItem(id: string): boolean {
    return this.itemsCollection.delete(id);
  }

  // Bulk operations
  createItemsBulk(items: Omit<PayrollItem, 'id' | 'createdAt' | 'updatedAt'>[]): PayrollItem[] {
    const now = new Date().toISOString();
    const newItems: PayrollItem[] = items.map((item) => ({
      ...item,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }));

    return this.itemsCollection.addMany(newItems);
  }
}

/**
 * Leave Service
 */
export class LeaveService {
  private requestsCollection: Collection<LeaveRequest>;
  private balancesCollection: Collection<LeaveBalance>;

  constructor() {
    this.requestsCollection = new Collection<LeaveRequest>(StorageKeys.LEAVE_REQUESTS, storage);
    this.balancesCollection = new Collection<LeaveBalance>(StorageKeys.LEAVE_BALANCES, storage);
  }

  // Leave Request methods
  getAllRequests(): LeaveRequest[] {
    return this.requestsCollection.getAll();
  }

  getRequestById(id: string): LeaveRequest | undefined {
    return this.requestsCollection.getById(id);
  }

  getRequestsByEmployee(employeeId: string): LeaveRequest[] {
    return this.requestsCollection.filter((req) => req.employeeId === employeeId);
  }

  getPendingRequests(): LeaveRequest[] {
    return this.requestsCollection.filter((req) => req.status === 'pending');
  }

  createRequest(request: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): LeaveRequest {
    const now = new Date().toISOString();
    const newRequest: LeaveRequest = {
      ...request,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    return this.requestsCollection.add(newRequest);
  }

  updateRequest(id: string, updates: Partial<LeaveRequest>): LeaveRequest {
    return this.requestsCollection.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  approveRequest(id: string, approvedBy: string): LeaveRequest {
    return this.updateRequest(id, {
      status: 'approved',
      approvedBy,
      approvedDate: new Date().toISOString(),
    });
  }

  rejectRequest(id: string, rejectionReason: string): LeaveRequest {
    return this.updateRequest(id, {
      status: 'rejected',
      rejectionReason,
    });
  }

  // Leave Balance methods
  getBalance(employeeId: string, year: number): LeaveBalance | undefined {
    return this.balancesCollection.find(
      (bal) => bal.employeeId === employeeId && bal.year === year
    );
  }

  updateBalance(employeeId: string, year: number, updates: Partial<LeaveBalance>): LeaveBalance {
    const existing = this.getBalance(employeeId, year);

    if (existing) {
      return this.balancesCollection.update(existing.employeeId + '_' + year, updates);
    } else {
      const newBalance: LeaveBalance = {
        id: `${employeeId}_${year}`,
        employeeId,
        year,
        annualLeaveEntitled: 30,
        annualLeaveTaken: 0,
        annualLeaveBalance: 30,
        sickLeaveTaken: 0,
        sickLeaveBalance: 90,
        unpaidLeaveTaken: 0,
        ...updates,
      };
      return this.balancesCollection.add(newBalance);
    }
  }
}

/**
 * Loan Service
 */
export class LoanService {
  private collection: Collection<Loan>;

  constructor() {
    this.collection = new Collection<Loan>(StorageKeys.LOANS, storage);
  }

  getAll(): Loan[] {
    return this.collection.getAll();
  }

  getById(id: string): Loan | undefined {
    return this.collection.getById(id);
  }

  getByEmployee(employeeId: string): Loan[] {
    return this.collection.filter((loan) => loan.employeeId === employeeId);
  }

  getActiveLoans(employeeId: string): Loan[] {
    return this.collection.filter(
      (loan) => loan.employeeId === employeeId && loan.status === 'active'
    );
  }

  create(loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>): Loan {
    const now = new Date().toISOString();
    const newLoan: Loan = {
      ...loan,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    return this.collection.add(newLoan);
  }

  update(id: string, updates: Partial<Loan>): Loan {
    return this.collection.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  recordPayment(id: string): Loan {
    const loan = this.getById(id);
    if (!loan) throw new Error('Loan not found');

    const paidInstallments = loan.paidInstallments + 1;
    const remainingAmount = loan.remainingAmount - loan.installmentAmount;
    const status = paidInstallments >= loan.numberOfInstallments ? 'paid' : 'active';

    return this.update(id, {
      paidInstallments,
      remainingAmount: Math.max(0, remainingAmount),
      status,
    });
  }
}

/**
 * Salary Advance Service
 */
export class SalaryAdvanceService {
  private collection: Collection<SalaryAdvance>;

  constructor() {
    this.collection = new Collection<SalaryAdvance>(StorageKeys.SALARY_ADVANCES, storage);
  }

  getAll(): SalaryAdvance[] {
    return this.collection.getAll();
  }

  getById(id: string): SalaryAdvance | undefined {
    return this.collection.getById(id);
  }

  getByEmployee(employeeId: string): SalaryAdvance[] {
    return this.collection.filter((adv) => adv.employeeId === employeeId);
  }

  getPending(): SalaryAdvance[] {
    return this.collection.filter((adv) => adv.approvalStatus === 'pending');
  }

  create(advance: Omit<SalaryAdvance, 'id' | 'createdAt' | 'updatedAt'>): SalaryAdvance {
    const now = new Date().toISOString();
    const newAdvance: SalaryAdvance = {
      ...advance,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    return this.collection.add(newAdvance);
  }

  update(id: string, updates: Partial<SalaryAdvance>): SalaryAdvance {
    return this.collection.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  approve(id: string, approvedBy: string): SalaryAdvance {
    return this.update(id, {
      approvalStatus: 'approved',
      approvedBy,
      approvedDate: new Date().toISOString(),
    });
  }

  reject(id: string): SalaryAdvance {
    return this.update(id, {
      approvalStatus: 'rejected',
    });
  }

  markDeducted(id: string, deductionMonth: string): SalaryAdvance {
    return this.update(id, {
      approvalStatus: 'deducted',
      deductionMonth,
      deductedDate: new Date().toISOString(),
    });
  }
}

/**
 * Payslip Service
 */
export class PayslipService {
  private collection: Collection<Payslip>;

  constructor() {
    this.collection = new Collection<Payslip>(StorageKeys.PAYSLIPS, storage);
  }

  getAll(): Payslip[] {
    return this.collection.getAll();
  }

  getById(id: string): Payslip | undefined {
    return this.collection.getById(id);
  }

  getByEmployee(employeeId: string): Payslip[] {
    return this.collection.filter((slip) => slip.employeeId === employeeId);
  }

  getByPeriod(payPeriod: string): Payslip[] {
    return this.collection.filter((slip) => slip.payPeriod === payPeriod);
  }

  create(payslip: Omit<Payslip, 'id'>): Payslip {
    const newPayslip: Payslip = {
      ...payslip,
      id: generateId(),
    };

    return this.collection.add(newPayslip);
  }

  delete(id: string): boolean {
    return this.collection.delete(id);
  }
}



/**
 * Company Settings Service
 */
export class CompanySettingsService {
  getSettings(): CompanySettings {
    return storage.get<CompanySettings>(StorageKeys.COMPANY_SETTINGS, this.getDefaultSettings());
  }

  updateSettings(updates: Partial<CompanySettings>): CompanySettings {
    const current = this.getSettings();
    const updated: CompanySettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storage.set(StorageKeys.COMPANY_SETTINGS, updated);
    return updated;
  }

  private getDefaultSettings(): CompanySettings {
    const now = new Date().toISOString();
    return {
      id: 'default',
      companyName: 'GMP Technologies India Pvt Ltd',
      pfRegistrationNumber: 'PF/123456',
      esicRegistrationNumber: 'ESIC/123456',
      panNumber: 'ABCDE1234F',
      gstin: '27ABCDE1234F1Z5',
      address: 'Business Park, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400001',
      phone: '+91 22 1234 5678',
      email: 'hr@gmptechnologies.in',
      payrollDayOfMonth: 28,
      weekendDays: [0, 6], // Sunday, Saturday
      publicHolidays: [],
      annualLeavePerYear: 21,
      sickLeaveFullPay: 12,
      maternityLeaveDays: 182,
      paternityLeaveDays: 15,
      createdAt: now,
      updatedAt: now,
    };
  }
}

/**
 * Public Holidays Service
 */
export class PublicHolidaysService {
  private collection: Collection<PublicHoliday>;

  constructor() {
    this.collection = new Collection<PublicHoliday>(StorageKeys.PUBLIC_HOLIDAYS, storage);
  }

  getAll(): PublicHoliday[] {
    return this.collection.getAll();
  }

  getByYear(year: number): PublicHoliday[] {
    return this.collection.filter(
      (holiday) => holiday.year === year || holiday.isRecurring
    );
  }

  create(holiday: Omit<PublicHoliday, 'id'>): PublicHoliday {
    const newHoliday: PublicHoliday = {
      ...holiday,
      id: generateId(),
    };

    return this.collection.add(newHoliday);
  }

  delete(id: string): boolean {
    return this.collection.delete(id);
  }
}

// Export service instances
export const employeeService = new EmployeeService();
export const payrollService = new PayrollService();
export const leaveService = new LeaveService();
export const loanService = new LoanService();
export const salaryAdvanceService = new SalaryAdvanceService();
export const payslipService = new PayslipService();
export const companySettingsService = new CompanySettingsService();
export const publicHolidaysService = new PublicHolidaysService();
