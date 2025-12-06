# 🏭 PAYROLLNEXUS-INDIA: BACKEND MODULES (PART 1)
## Organization & HR Core - Enterprise Grade

This document contains the complete source code for the Organization (Vendors, Clients, Entities) and HR Core (Employees) modules.

---

## 📦 1. VENDORS MODULE

### File: `backend/src/modules/vendors/dto/create-vendor.dto.ts`

```typescript
import { IsString, IsEmail, IsOptional, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty({ example: 'V001', description: 'Unique vendor code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Acme Payroll Services', description: 'Vendor name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Acme Payroll Services Pvt Ltd', description: 'Legal name' })
  @IsString()
  @IsNotEmpty()
  legalName: string;

  @ApiProperty({ example: 'contact@acme.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  panNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  gstNumber?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}
```

### File: `backend/src/modules/vendors/vendors.service.ts`

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVendorDto: CreateVendorDto) {
    const existing = await this.prisma.vendor.findUnique({
      where: { code: createVendorDto.code },
    });

    if (existing) {
      throw new ConflictException('Vendor with this code already exists');
    }

    return this.prisma.vendor.create({
      data: createVendorDto,
    });
  }

  async findAll() {
    return this.prisma.vendor.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        clients: true,
        users: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async update(id: string, updateVendorDto: any) {
    await this.findOne(id);
    return this.prisma.vendor.update({
      where: { id },
      data: updateVendorDto,
    });
  }
}
```

### File: `backend/src/modules/vendors/vendors.controller.ts`

```typescript
import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';

@ApiTags('Vendors')
@Controller('vendors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vendor' })
  create(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorsService.create(createVendorDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all vendors' })
  findAll() {
    return this.vendorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor details' })
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update vendor' })
  update(@Param('id') id: string, @Body() updateVendorDto: any) {
    return this.vendorsService.update(id, updateVendorDto);
  }
}
```

### File: `backend/src/modules/vendors/vendors.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';

@Module({
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService],
})
export class VendorsModule {}
```

---

## 🏢 2. CLIENTS MODULE

### File: `backend/src/modules/clients/dto/create-client.dto.ts`

```typescript
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  legalName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  panNumber: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tanNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  gstNumber?: string;

  @ApiProperty({ default: 'MONTHLY' })
  @IsEnum(['MONTHLY', 'WEEKLY', 'BI_WEEKLY'])
  @IsOptional()
  payFrequency?: 'MONTHLY' | 'WEEKLY' | 'BI_WEEKLY';

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  payDay?: number;
}
```

### File: `backend/src/modules/clients/clients.service.ts`

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const existing = await this.prisma.client.findFirst({
      where: {
        vendorId: createClientDto.vendorId,
        code: createClientDto.code,
      },
    });

    if (existing) {
      throw new ConflictException('Client code already exists for this vendor');
    }

    return this.prisma.client.create({
      data: createClientDto,
    });
  }

  async findAll(vendorId?: string) {
    return this.prisma.client.findMany({
      where: {
        ...(vendorId ? { vendorId } : {}),
        status: { not: 'TERMINATED' },
      },
      include: {
        entities: true,
        _count: {
          select: { employees: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        entities: true,
        departments: true,
        designations: true,
        payElements: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }
}
```

### File: `backend/src/modules/clients/clients.controller.ts`

```typescript
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all clients' })
  @ApiQuery({ name: 'vendorId', required: false })
  findAll(@Query('vendorId') vendorId?: string) {
    return this.clientsService.findAll(vendorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client details' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }
}
```

### File: `backend/src/modules/clients/clients.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
```

---

## 🏭 3. ENTITIES MODULE

### File: `backend/src/modules/entities/dto/create-entity.dto.ts`

```typescript
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEntityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  legalName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stateName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  pfEstablishmentCode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  esiCode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ptRegistrationNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tanNumber?: string;
}
```

### File: `backend/src/modules/entities/entities.service.ts`

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { CreateEntityDto } from './dto/create-entity.dto';

@Injectable()
export class EntitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEntityDto: CreateEntityDto) {
    const existing = await this.prisma.entity.findFirst({
      where: {
        clientId: createEntityDto.clientId,
        code: createEntityDto.code,
      },
    });

    if (existing) {
      throw new ConflictException('Entity code already exists for this client');
    }

    return this.prisma.entity.create({
      data: createEntityDto,
    });
  }

  async findAll(clientId: string) {
    return this.prisma.entity.findMany({
      where: { clientId },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const entity = await this.prisma.entity.findUnique({
      where: { id },
      include: {
        statutoryConfigs: true,
      },
    });

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    return entity;
  }
}
```

### File: `backend/src/modules/entities/entities.controller.ts`

```typescript
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EntitiesService } from './entities.service';
import { CreateEntityDto } from './dto/create-entity.dto';

@ApiTags('Entities')
@Controller('entities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new entity' })
  create(@Body() createEntityDto: CreateEntityDto) {
    return this.entitiesService.create(createEntityDto);
  }

  @Get()
  @ApiOperation({ summary: 'List entities for a client' })
  findAll(@Query('clientId') clientId: string) {
    return this.entitiesService.findAll(clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity details' })
  findOne(@Param('id') id: string) {
    return this.entitiesService.findOne(id);
  }
}
```

### File: `backend/src/modules/entities/entities.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { EntitiesController } from './entities.controller';

@Module({
  controllers: [EntitiesController],
  providers: [EntitiesService],
  exports: [EntitiesService],
})
export class EntitiesModule {}
```

---

## 👥 4. EMPLOYEES MODULE

### File: `backend/src/modules/employees/dto/create-employee.dto.ts`

```typescript
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsDateString, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  gender: 'MALE' | 'FEMALE' | 'OTHER';

  @ApiProperty()
  @IsDateString()
  joiningDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  workEmail?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  ctcMonthly?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  panNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  aadharNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  uanNumber?: string;
}
```

### File: `backend/src/modules/employees/employees.service.ts`

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const existing = await this.prisma.employee.findFirst({
      where: {
        clientId: createEmployeeDto.clientId,
        employeeCode: createEmployeeDto.employeeCode,
      },
    });

    if (existing) {
      throw new ConflictException('Employee code already exists for this client');
    }

    // Calculate full name
    const fullName = `${createEmployeeDto.firstName} ${createEmployeeDto.lastName}`;

    return this.prisma.employee.create({
      data: {
        ...createEmployeeDto,
        fullName,
        displayName: fullName,
        status: 'ACTIVE',
      },
    });
  }

  async findAll(clientId: string, entityId?: string) {
    return this.prisma.employee.findMany({
      where: {
        clientId,
        ...(entityId ? { entityId } : {}),
      },
      include: {
        department: true,
        designation: true,
        entity: true,
      },
      orderBy: { employeeCode: 'asc' },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        designation: true,
        entity: true,
        payConfigs: {
          include: { payElement: true },
        },
        bankDetails: true, // Assuming relation exists or fields are on employee
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: any) {
    await this.findOne(id);
    return this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
    });
  }

  async bulkImport(clientId: string, employees: CreateEmployeeDto[]) {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const emp of employees) {
      try {
        await this.create({ ...emp, clientId });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          employeeCode: emp.employeeCode,
          error: error.message,
        });
      }
    }

    return results;
  }
}
```

### File: `backend/src/modules/employees/employees.controller.ts`

```typescript
import { Controller, Get, Post, Body, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Post('bulk-import')
  @ApiOperation({ summary: 'Bulk import employees' })
  bulkImport(@Body() body: { clientId: string; employees: CreateEmployeeDto[] }) {
    return this.employeesService.bulkImport(body.clientId, body.employees);
  }

  @Get()
  @ApiOperation({ summary: 'List employees' })
  @ApiQuery({ name: 'clientId', required: true })
  @ApiQuery({ name: 'entityId', required: false })
  findAll(@Query('clientId') clientId: string, @Query('entityId') entityId?: string) {
    return this.employeesService.findAll(clientId, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee details' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee' })
  update(@Param('id') id: string, @Body() updateEmployeeDto: any) {
    return this.employeesService.update(id, updateEmployeeDto);
  }
}
```

### File: `backend/src/modules/employees/employees.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
```
