# 🏭 PAYROLLNEXUS-INDIA: BACKEND MODULES (PART 3)
## Reporting & System - Enterprise Grade

This document contains the complete source code for Payslips, Reports, Audit Logs, and Dashboard modules.

---

## 📄 7. PAYSLIPS MODULE

### File: `backend/src/modules/payslips/payslips.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';

@Injectable()
export class PayslipsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateAll(payrollRunId: string) {
    const run = await this.prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: { lineItems: true },
    });

    if (!run || run.status !== 'APPROVED') {
      throw new Error('Payroll run must be approved to generate payslips');
    }

    let generated = 0;

    for (const item of run.lineItems) {
      const payslipNumber = `PS-${run.runCode}-${item.employeeCode}`;
      
      await this.prisma.payslip.upsert({
        where: { payrollLineItemId: item.id },
        create: {
          payrollRunId: run.id,
          payrollLineItemId: item.id,
          employeeId: item.employeeId,
          payslipNumber,
          periodYear: run.periodYear,
          periodMonth: run.periodMonth,
          periodName: `${run.periodMonth}/${run.periodYear}`,
          employeeCode: item.employeeCode,
          employeeName: item.employeeName,
          departmentName: item.departmentName,
          designationName: item.designationName,
          grossSalary: item.grossSalary,
          totalDeductions: item.totalDeductions,
          netSalary: item.netSalary,
          status: 'GENERATED',
          // In real app, generate HTML/PDF here
          payslipHtml: '<h1>Payslip Placeholder</h1>', 
        },
        update: {
          grossSalary: item.grossSalary,
          totalDeductions: item.totalDeductions,
          netSalary: item.netSalary,
        },
      });
      generated++;
    }

    return { generated };
  }

  async findOne(id: string) {
    const payslip = await this.prisma.payslip.findUnique({
      where: { id },
    });
    if (!payslip) throw new NotFoundException('Payslip not found');
    return payslip;
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.payslip.findMany({
      where: { employeeId },
      orderBy: { periodYear: 'desc', periodMonth: 'desc' },
    });
  }
}
```

### File: `backend/src/modules/payslips/payslips.controller.ts`

```typescript
import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PayslipsService } from './payslips.service';

@ApiTags('Payslips')
@Controller('payslips')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PayslipsController {
  constructor(private readonly payslipsService: PayslipsService) {}

  @Post('generate/:payrollRunId')
  @ApiOperation({ summary: 'Generate payslips for run' })
  generate(@Param('payrollRunId') payrollRunId: string) {
    return this.payslipsService.generateAll(payrollRunId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get employee payslips' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.payslipsService.findByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payslip details' })
  findOne(@Param('id') id: string) {
    return this.payslipsService.findOne(id);
  }
}
```

### File: `backend/src/modules/payslips/payslips.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { PayslipsService } from './payslips.service';
import { PayslipsController } from './payslips.controller';

@Module({
  controllers: [PayslipsController],
  providers: [PayslipsService],
  exports: [PayslipsService],
})
export class PayslipsModule {}
```

---

## 📊 8. REPORTS MODULE

### File: `backend/src/modules/reports/reports.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPayrollSummary(entityId: string, year: number, month: number) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { entityId, periodYear: year, periodMonth: month },
      include: {
        _count: { select: { lineItems: true } },
      },
    });

    if (!run) return null;

    return {
      runId: run.id,
      totalGross: run.totalGross,
      totalDeductions: run.totalDeductions,
      totalNet: run.totalNetPay,
      employeeCount: run.totalEmployees,
      processedCount: run.processedEmployees,
    };
  }

  async getStatutorySummary(entityId: string, year: number, month: number) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { entityId, periodYear: year, periodMonth: month },
    });

    if (!run) return null;

    return {
      epf: {
        employee: run.totalEpfEmployee,
        employer: run.totalEpfEmployer,
        total: Number(run.totalEpfEmployee) + Number(run.totalEpfEmployer),
      },
      esi: {
        employee: run.totalEsiEmployee,
        employer: run.totalEsiEmployer,
        total: Number(run.totalEsiEmployee) + Number(run.totalEsiEmployer),
      },
      pt: run.totalPt,
      tds: run.totalTds,
    };
  }
}
```

### File: `backend/src/modules/reports/reports.controller.ts`

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('payroll-summary')
  @ApiOperation({ summary: 'Get payroll summary report' })
  getPayrollSummary(
    @Query('entityId') entityId: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.reportsService.getPayrollSummary(entityId, Number(year), Number(month));
  }

  @Get('statutory-summary')
  @ApiOperation({ summary: 'Get statutory summary report' })
  getStatutorySummary(
    @Query('entityId') entityId: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.reportsService.getStatutorySummary(entityId, Number(year), Number(month));
  }
}
```

### File: `backend/src/modules/reports/reports.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
```

---

## 🔒 9. AUDIT LOGS MODULE

### File: `backend/src/modules/audit-logs/audit-logs.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    const { page = 1, limit = 20, entityId, userId } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(entityId ? { entityId } : {}),
      ...(userId ? { userId } : {}),
    };

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { email: true, displayName: true } } },
      }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  async log(data: any) {
    return this.prisma.auditLog.create({ data });
  }
}
```

### File: `backend/src/modules/audit-logs/audit-logs.controller.ts`

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs' })
  findAll(@Query() query: any) {
    return this.auditLogsService.findAll(query);
  }
}
```

### File: `backend/src/modules/audit-logs/audit-logs.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';

@Global()
@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogsService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
```

---

## 📈 10. DASHBOARD MODULE

### File: `backend/src/modules/dashboard/dashboard.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [vendors, clients, employees, activePayroll] = await Promise.all([
      this.prisma.vendor.count(),
      this.prisma.client.count(),
      this.prisma.employee.count({ where: { status: 'ACTIVE' } }),
      this.prisma.payrollRun.count({ where: { status: 'PROCESSING' } }),
    ]);

    return {
      vendors,
      clients,
      employees,
      activePayroll,
    };
  }
}
```

### File: `backend/src/modules/dashboard/dashboard.controller.ts`

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard stats' })
  getStats() {
    return this.dashboardService.getStats();
  }
}
```

### File: `backend/src/modules/dashboard/dashboard.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
```
