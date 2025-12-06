# 🧪 PAYROLLNEXUS-INDIA: TEST SUITE
## Enterprise Grade Testing - Unit, Integration, E2E

This document contains the complete test suite for critical components.

---

## 🧪 UNIT TESTS

### File: `backend/src/core/formula-engine/formula-engine.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { FormulaEngineService } from './formula-engine.service';

describe('FormulaEngineService', () => {
  let service: FormulaEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormulaEngineService],
    }).compile();

    service = module.get<FormulaEngineService>(FormulaEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('evaluate', () => {
    it('should evaluate simple math', () => {
      const result = service.evaluate('10 + 20', {} as any);
      expect(result).toBe(30);
    });

    it('should use context variables', () => {
      const context = {
        elements: { basic: 1000 },
        employee: {},
        payroll: {},
        statutory: {},
      };
      const result = service.evaluate('elements.basic * 0.5', context as any);
      expect(result).toBe(500);
    });

    it('should support helper functions (min)', () => {
      const result = service.evaluate('min(100, 50)', {} as any);
      expect(result).toBe(50);
    });

    it('should support helper functions (if_else)', () => {
      const result = service.evaluate('if_else(10 > 5, 100, 0)', {} as any);
      expect(result).toBe(100);
    });
  });

  describe('circular dependency', () => {
    it('should detect circular dependency', () => {
      const graph = new Map<string, string[]>();
      graph.set('A', ['B']);
      graph.set('B', ['A']);

      expect(() => service.topologicalSort(graph)).toThrow();
    });
  });
});
```

### File: `backend/src/modules/statutory/services/epf.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { EPFService } from './epf.service';

describe('EPFService', () => {
  let service: EPFService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EPFService],
    }).compile();

    service = module.get<EPFService>(EPFService);
  });

  it('should calculate EPF correctly for salary < 15000', () => {
    const result = service.calculate(10000);
    
    expect(result.pfWage).toBe(10000);
    expect(result.employeeContribution).toBe(1200); // 12%
    expect(result.employerTotalContribution).toBe(1200); // 12%
    expect(result.employerEPSContribution).toBe(833); // 8.33%
    expect(result.employerEPFContribution).toBe(367); // 3.67%
  });

  it('should cap EPF calculation at 15000 ceiling', () => {
    const result = service.calculate(20000);
    
    expect(result.pfWage).toBe(15000);
    expect(result.employeeContribution).toBe(1800); // 12% of 15000
  });
});
```

---

## 🔄 INTEGRATION TESTS

### File: `backend/test/payroll-flow.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Payroll Flow (E2E)', () => {
  let app: INestApplication;
  let authToken: string;
  let clientId: string;
  let entityId: string;
  let employeeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 1. Login
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'demo' });
    
    authToken = loginRes.body.access_token;
  });

  it('1. Create Client', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        vendorId: 'vendor-1',
        code: 'CL001',
        name: 'Test Client',
        legalName: 'Test Client Pvt Ltd',
        email: 'client@test.com',
        panNumber: 'ABCDE1234F'
      });
    
    expect(res.status).toBe(201);
    clientId = res.body.id;
  });

  it('2. Create Entity', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/entities')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        clientId,
        code: 'ENT001',
        name: 'Test Entity',
        legalName: 'Test Entity',
        state: 'MH',
        stateName: 'Maharashtra'
      });
    
    expect(res.status).toBe(201);
    entityId = res.body.id;
  });

  it('3. Create Employee', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/employees')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        clientId,
        entityId,
        employeeCode: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
        joiningDate: '2023-01-01',
        mobileNumber: '9876543210',
        ctcMonthly: 50000
      });
    
    expect(res.status).toBe(201);
    employeeId = res.body.id;
  });

  it('4. Run Payroll', async () => {
    // Create Run
    const runRes = await request(app.getHttpServer())
      .post('/api/v1/payroll')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        clientId,
        entityId,
        periodYear: 2023,
        periodMonth: 4,
        periodStart: '2023-04-01',
        periodEnd: '2023-04-30'
      });
    
    expect(runRes.status).toBe(201);
    const runId = runRes.body.id;

    // Calculate
    const calcRes = await request(app.getHttpServer())
      .post(`/api/v1/payroll/${runId}/calculate`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(calcRes.status).toBe(201);
    expect(calcRes.body.success).toBe(true);
    expect(calcRes.body.processed).toBe(1);
  });

  afterAll(async () => {
    await app.close();
  });
});
```
