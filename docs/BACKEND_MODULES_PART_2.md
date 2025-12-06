# 🏭 PAYROLLNEXUS-INDIA: BACKEND MODULES (PART 2)
## Payroll Core & Statutory - Enterprise Grade

This document contains the complete source code for Pay Elements, Payroll Processing, and Statutory modules.

---

## 💰 5. PAY ELEMENTS MODULE

### File: `backend/src/modules/pay-elements/dto/create-pay-element.dto.ts`

```typescript
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ElementType {
  EARNING = 'EARNING',
  DEDUCTION = 'DEDUCTION',
  STATUTORY_DEDUCTION = 'STATUTORY_DEDUCTION',
  EMPLOYER_CONTRIBUTION = 'EMPLOYER_CONTRIBUTION',
  REIMBURSEMENT = 'REIMBURSEMENT',
  PERQUISITE = 'PERQUISITE',
}

export enum CalculationType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
  FORMULA = 'FORMULA',
  SLAB = 'SLAB',
}

export class CreatePayElementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  entityId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ElementType })
  @IsEnum(ElementType)
  elementType: ElementType;

  @ApiProperty({ enum: CalculationType })
  @IsEnum(CalculationType)
  calculationType: CalculationType;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  fixedAmount?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  percentageValue?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  baseElementCode?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  formula?: Record<string, any>;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isTaxable?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isPartOfGross?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isPfApplicable?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isEsiApplicable?: boolean;
}
```

### File: `backend/src/modules/pay-elements/pay-elements.service.ts`

```typescript
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { FormulaEngineService } from '@/core/formula-engine/formula-engine.service';
import { CreatePayElementDto } from './dto/create-pay-element.dto';

@Injectable()
export class PayElementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly formulaEngine: FormulaEngineService,
  ) {}

  async create(createPayElementDto: CreatePayElementDto, userId: string) {
    // Validate formula if applicable
    if (createPayElementDto.calculationType === 'FORMULA' && createPayElementDto.formula?.expression) {
      const validation = this.formulaEngine.validate(createPayElementDto.formula.expression);
      if (!validation.valid) {
        throw new BadRequestException(`Invalid formula: ${validation.error}`);
      }
    }

    const existing = await this.prisma.payElement.findFirst({
      where: {
        clientId: createPayElementDto.clientId,
        code: createPayElementDto.code,
        isLatestVersion: true,
      },
    });

    if (existing) {
      throw new ConflictException('Pay element code already exists');
    }

    return this.prisma.payElement.create({
      data: {
        ...createPayElementDto,
        createdBy: userId,
        effectiveFrom: new Date(),
        version: 1,
        isLatestVersion: true,
        isApproved: true, // Auto-approve for demo
      },
    });
  }

  async findAll(clientId: string, entityId?: string) {
    return this.prisma.payElement.findMany({
      where: {
        clientId,
        OR: [
          { entityId: null },
          ...(entityId ? [{ entityId }] : []),
        ],
        isLatestVersion: true,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const element = await this.prisma.payElement.findUnique({
      where: { id },
    });

    if (!element) {
      throw new NotFoundException('Pay element not found');
    }

    return element;
  }

  async validateFormula(expression: string) {
    return this.formulaEngine.validate(expression);
  }
}
```

### File: `backend/src/modules/pay-elements/pay-elements.controller.ts`

```typescript
import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PayElementsService } from './pay-elements.service';
import { CreatePayElementDto } from './dto/create-pay-element.dto';

@ApiTags('Pay Elements')
@Controller('pay-elements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PayElementsController {
  constructor(private readonly payElementsService: PayElementsService) {}

  @Post()
  @ApiOperation({ summary: 'Create pay element' })
  create(@Body() createPayElementDto: CreatePayElementDto, @Request() req) {
    return this.payElementsService.create(createPayElementDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List pay elements' })
  findAll(@Query('clientId') clientId: string, @Query('entityId') entityId?: string) {
    return this.payElementsService.findAll(clientId, entityId);
  }

  @Post('validate-formula')
  @ApiOperation({ summary: 'Validate formula expression' })
  validateFormula(@Body('expression') expression: string) {
    return this.payElementsService.validateFormula(expression);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pay element details' })
  findOne(@Param('id') id: string) {
    return this.payElementsService.findOne(id);
  }
}
```

### File: `backend/src/modules/pay-elements/pay-elements.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { PayElementsService } from './pay-elements.service';
import { PayElementsController } from './pay-elements.controller';
import { FormulaEngineModule } from '@/core/formula-engine/formula-engine.module';

@Module({
  imports: [FormulaEngineModule],
  controllers: [PayElementsController],
  providers: [PayElementsService],
  exports: [PayElementsService],
})
export class PayElementsModule {}
```

---

## 💸 6. PAYROLL MODULE

### File: `backend/src/modules/payroll/dto/create-payroll-run.dto.ts`

```typescript
import { IsString, IsNotEmpty, IsInt, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayrollRunDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty()
  @IsInt()
  @Min(2000)
  @Max(2100)
  periodYear: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth: number;

  @ApiProperty()
  @IsDateString()
  periodStart: string;

  @ApiProperty()
  @IsDateString()
  periodEnd: string;
}
```

### File: `backend/src/modules/payroll/payroll.service.ts`

```typescript
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { PayrollProcessorService } from './payroll-processor.service'; // From PART 1
import { CreatePayrollRunDto } from './dto/create-payroll-run.dto';

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly processor: PayrollProcessorService,
  ) {}

  async create(dto: CreatePayrollRunDto, userId: string) {
    // Check for existing run
    const existing = await this.prisma.payrollRun.findFirst({
      where: {
        entityId: dto.entityId,
        periodYear: dto.periodYear,
        periodMonth: dto.periodMonth,
        runType: 'REGULAR',
        status: { not: 'CANCELLED' },
      },
    });

    if (existing) {
      throw new ConflictException('Payroll run already exists for this period');
    }

    // Generate run code
    const runCode = `PR-${dto.periodYear}-${dto.periodMonth.toString().padStart(2, '0')}-${Date.now().toString().slice(-4)}`;

    return this.prisma.payrollRun.create({
      data: {
        ...dto,
        runCode,
        status: 'DRAFT',
        processedBy: userId,
      },
    });
  }

  async findAll(entityId: string) {
    return this.prisma.payrollRun.findMany({
      where: { entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const run = await this.prisma.payrollRun.findUnique({
      where: { id },
      include: {
        _count: { select: { lineItems: true } },
      },
    });

    if (!run) throw new NotFoundException('Payroll run not found');
    return run;
  }

  async calculate(id: string) {
    return this.processor.processPayroll(id);
  }

  async getLineItems(id: string) {
    return this.prisma.payrollLineItem.findMany({
      where: { payrollRunId: id },
      orderBy: { employeeName: 'asc' },
    });
  }

  async submitForApproval(id: string) {
    return this.prisma.payrollRun.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL' },
    });
  }

  async approve(id: string, userId: string) {
    return this.prisma.payrollRun.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });
  }
}
```

### File: `backend/src/modules/payroll/payroll.controller.ts`

```typescript
import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PayrollService } from './payroll.service';
import { CreatePayrollRunDto } from './dto/create-payroll-run.dto';

@ApiTags('Payroll')
@Controller('payroll')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  @ApiOperation({ summary: 'Create payroll run' })
  create(@Body() dto: CreatePayrollRunDto, @Request() req) {
    return this.payrollService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List payroll runs' })
  findAll(@Query('entityId') entityId: string) {
    return this.payrollService.findAll(entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll run details' })
  findOne(@Param('id') id: string) {
    return this.payrollService.findOne(id);
  }

  @Post(':id/calculate')
  @ApiOperation({ summary: 'Calculate payroll' })
  calculate(@Param('id') id: string) {
    return this.payrollService.calculate(id);
  }

  @Get(':id/line-items')
  @ApiOperation({ summary: 'Get payroll line items' })
  getLineItems(@Param('id') id: string) {
    return this.payrollService.getLineItems(id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit for approval' })
  submit(@Param('id') id: string) {
    return this.payrollService.submitForApproval(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve payroll run' })
  approve(@Param('id') id: string, @Request() req) {
    return this.payrollService.approve(id, req.user.id);
  }
}
```

### File: `backend/src/modules/payroll/payroll.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { PayrollProcessorService } from './payroll-processor.service';
import { FormulaEngineModule } from '@/core/formula-engine/formula-engine.module';
import { StatutoryModule } from '../statutory/statutory.module';

@Module({
  imports: [FormulaEngineModule, StatutoryModule],
  controllers: [PayrollController],
  providers: [PayrollService, PayrollProcessorService],
  exports: [PayrollService],
})
export class PayrollModule {}
```
