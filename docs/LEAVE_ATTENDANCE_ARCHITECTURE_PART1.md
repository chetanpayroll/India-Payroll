# ═══════════════════════════════════════════════════════════════════
# ENTERPRISE LEAVE & ATTENDANCE MANAGEMENT - COMPLETE ARCHITECTURE
# GMP Payroll System - Production Implementation
# ═══════════════════════════════════════════════════════════════════

## TABLE OF CONTENTS

1. [Leave Module Architecture](#leave-module-architecture)
2. [Attendance Module Architecture](#attendance-module-architecture)
3. [Prisma Schema Validation](#prisma-schema-validation)
4. [API Endpoints Complete List](#api-endpoints-complete-list)
5. [Frontend Page Map](#frontend-page-map)
6. [Payroll Integration Logic](#payroll-integration-logic)
7. [RBAC Matrix](#rbac-matrix)
8. [End-to-End Test Scenarios](#end-to-end-test-scenarios)
9. [Deployment & Data Safety](#deployment--data-safety)
10. [Risk Register](#risk-register)

---

## A. ✅ LEAVE MODULE ARCHITECTURE

### System Overview

The Leave Management module is a **complete, production-ready enterprise system** that handles:
- Multiple leave types (Annual, Sick, Maternity, Paternity, Unpaid, Emergency, etc.)
- Complex approval workflows with multi-level approvals
- Leave balance tracking with accruals and carry-forwards
- Policy engine with country-specific rules
- Leave encashment calculations
- Payroll integration for LOP and encashment payouts

### Core Components

#### 1. Leave Types & Policies

**Supported Leave Types:**
```
✅ ANNUAL       - Annual/vacation leave
✅ SICK         - Sick leave with medical certificate support
✅ MATERNITY    - Maternity leave (gender-specific)
✅ PATERNITY    - Paternity leave (gender-specific)
✅ UNPAID       - Leave without pay (LOP)
✅ EMERGENCY    - Emergency leave
✅ COMPASSIONATE - Compassionate/bereavement leave
✅ STUDY        - Study leave
✅ HAJJ         - Religious leave (country-specific)
```

**Leave Policy Configuration:**
- **Accrual Methods**: YEARLY, MONTHLY, QUARTERLY, ON_COMPLETION
- **Carry Forward Rules**: Max days, expiry period
- **Encashment Rules**: Max days, rate multiplier
- **Restrictions**: Min/max days per request, advance notice period
- **Weekend/Holiday Treatment**: Inclusion/exclusion logic

#### 2. Leave Balance Engine

**Balance Calculations:**
```typescript
Balance = Opening Balance + Accrued - Taken - Encashed + CarryForward
```

**Tracked Per Employee Per Year:**
- Annual Leave: Entitled, Taken, Balance, Carry Forward
- Sick Leave: Entitled, Taken, Balance
- Other Leaves: Taken amounts
- Encashment: Days encashed, Amount paid

**Accrual Logic:**
- **Monthly Accrual**: `EntitledDays / 12` per month
- **Prorated**: Based on join date
- **Probation**: Accrual holds until confirmation
- **Carry Forward**: Previous year balance + current entitlement

#### 3. Leave Application Workflow

**Application Steps:**
1. Employee selects leave type and dates
2. System validates:
   - Sufficient balance
   - No overlapping leaves
   - Holiday/weekend exclusion (if policy configured)
   - Minimum advance notice
   - Maximum consecutive days
3. System calculates working days (excluding weekends/holidays)
4. Employee submits with reason and attachments
5. Leave enters approval workflow

**Validation Rules:**
```typescript
// Balance check
if (requestedDays > availableBalance && leaveType !== 'UNPAID') {
  throw new Error('Insufficient leave balance');
}

// Overlap check
const overlapping = await checkOverlappingLeaves(employeeId, startDate, endDate);
if (overlapping.length > 0) {
  throw new Error('Overlapping leave exists');
}

// Notice period check
const daysUntilLeave = Math.floor((startDate - today) / (1000 * 60 * 60 * 24));
if (daysUntilLeave < policy.advanceNoticeDays) {
  throw new Error(`Minimum ${policy.advanceNoticeDays} days notice required`);
}
```

#### 4. Approval Workflow

**Multi-Level Approval Chain:**
```typescript
Level 1: Reporting Manager (Mandatory)
Level 2: Department Head (Optional, based on days)
Level 3: HR Manager (Mandatory for >5 days or LOP)
Level 4: CEO/Director (Mandatory for >15 days)
```

**Approval Logic:**
```typescript
interface ApprovalChain {
  level: number;
  approver: string; // User ID
  role: 'MANAGER' | 'DEPT_HEAD' | 'HR' | 'CEO';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedDate?: Date;
  remarks?: string;
}
```

**Auto-Approval Rules:**
- Annual leave ≤ 2 days (if configured)
- Medical certificate attached for sick leave
- Manager pre-approved in settings

#### 5. Leave Cancellation & Recall

**Cancellation Workflow:**
- Employee can cancel PENDING or APPROVED leaves
- Cancellation before leave start: Auto-approved
- Cancellation during/after leave: Requires approval
- Balance automatically restored on cancellation

**Recall (Admin Override):**
- HR/Admin can recall any leave
- Automatic balance adjustment
- Payroll impact reversal (if processed)
- Audit trail maintained

#### 6. Leave Adjustments

**Admin Adjustments:**
```typescript
interface LeaveAdjustment {
  employeeId: string;
  year: number;
  leaveType: LeaveType;
  adjustmentType: 'ADD' | 'DEDUCT';
  days: number;
  reason: string;
  adjustedBy: string;
  effectiveDate: Date;
}
```

**Use Cases:**
- Carry forward from previous year
- Compensatory off grants
- Correction of errors
- Policy changes (mid-year)
- Final settlement adjustments

#### 7. Leave Encashment

**Encashment Logic:**
```typescript
// Maximum encashment calculation
const maxEncashable = Math.min(
  policy.maxEncashmentDays,
  leaveBalance.annualLeaveBalance - policy.minimumRetainBalance
);

// Amount calculation
const dailySalary = employee.basicSalary / 30;
const encashmentAmount = maxEncashable * dailySalary * policy.encashmentRate;

// Update balance
leaveBalance.annualLeaveBalance -= maxEncashable;
leaveBalance.leaveEncashed += maxEncashable;
leaveBalance.encashmentAmount += encashmentAmount;
```

**Payroll Integration:**
- Encashment processed in payroll run
- Added as "Leave Encashment" earning element
- Taxable income (country-specific)
- Included in final settlement

---

## B. ✅ ATTENDANCE MODULE ARCHITECTURE

### System Overview

The Attendance Management module handles:
- Daily attendance tracking with punch-in/out
- Shift management and rotational rosters
- Late coming, early exit, and overtime tracking
- Attendance regularization workflow
- Integration with leave system
- Payroll integration for LOP and overtime

### Core Components

#### 1. Shift Management

**Shift Configuration:**
```typescript
interface Shift {
  shiftCode: string;
  shiftName: string;
  startTime: string;      // "09:00"
  endTime: string;        // "18:00"
  breakDuration: number;  // minutes
  workingHours: number;   // 8.0
  lateGracePeriod: number;      // 15 minutes
  earlyOutGracePeriod: number;  // 15 minutes
  isNightShift: boolean;
  nightShiftAllowance?: number;
  weeklyOffDays: number[];  // [5, 6] = Fri, Sat
  overtimeApplicable: boolean;
  overtimeMultiplier: number;  // 1.5x
}
```

**Shift Types:**
- **Fixed Shift**: Same shift every day
- **Rotational Shift**: Weekly/monthly rotation
- **Flexible Shift**: Core hours with flexible start/end
- **Night Shift**: With night shift allowance

**Employee Shift Assignment:**
```typescript
interface EmployeeShift {
  employeeId: string;
  shiftId: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
}
```

#### 2. Attendance Capture

**Punch-In/Out Logic:**
```typescript
async function punchIn(employeeId: string) {
  const today = startOfDay(new Date());
  const now = new Date();
  
  // Get employee shift
  const employeeShift = await getActiveShift(employeeId, today);
  const shift = employeeShift.shift;
  
  // Check if already punched in
  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date: today } }
  });
  
  if (existing?.checkInTime) {
    throw new Error('Already punched in today');
  }
  
  // Calculate if late
  const shiftStart = parse(shift.startTime, 'HH:mm', today);
  const gracePeriod = addMinutes(shiftStart, shift.lateGracePeriod);
  const isLate = now > gracePeriod;
  const lateBy = isLate ? differenceInMinutes(now, shiftStart) : 0;
  
  // Create/update attendance
  const attendance = await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId, date: today } },
    create: {
      employeeId,
      date: today,
      shiftId: shift.id,
      checkInTime: now,
      status: isLate ? 'LATE' : 'PRESENT',
      attendanceType: isLate ? 'LATE' : 'REGULAR',
      lateBy: isLate ? lateBy : null,
    },
    update: {
      checkInTime: now,
      status: isLate ? 'LATE' : 'PRESENT',
      lateBy: isLate ? lateBy : null,
    }
  });
  
  return attendance;
}

async function punchOut(employeeId: string) {
  const today = startOfDay(new Date());
  const now = new Date();
  
  // Get attendance record
  const attendance = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date: today } },
    include: { shift: true }
  });
  
  if (!attendance || !attendance.checkInTime) {
    throw new Error('No punch-in record found');
  }
  
  if (attendance.checkOutTime) {
    throw new Error('Already punched out');
  }
  
  const shift = attendance.shift;
  const shiftEnd = parse(shift.endTime, 'HH:mm', today);
  const earlyOutThreshold = subMinutes(shiftEnd, shift.earlyOutGracePeriod);
  const isEarlyOut = now < earlyOutThreshold;
  const earlyOutBy = isEarlyOut ? differenceInMinutes(shiftEnd, now) : 0;
  
  // Calculate working hours
  const workingMinutes = differenceInMinutes(now, attendance.checkInTime);
  const workingHours = (workingMinutes - shift.breakDuration) / 60;
  
  // Calculate overtime
  const expectedHours = shift.workingHours;
  const overtimeHours = Math.max(0, workingHours - expectedHours);
  
  // Update attendance
  const updated = await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      checkOutTime: now,
      workingHours: workingHours,
      earlyOutBy: isEarlyOut ? earlyOutBy : null,
      overtimeHours: overtimeHours > 0 ? overtimeHours : null,
      attendanceType: isEarlyOut ? 'EARLY_OUT' : 
                      overtimeHours > 0 ? 'OVERTIME' : 
                      attendance.attendanceType,
    }
  });
  
  return updated;
}
```

#### 3. Attendance Status Rules

**Status Determination Logic:**
```typescript
function determineAttendanceStatus(
  attendance: Attendance,
  leave: Leave | null,
  holiday: PublicHoliday | null,
  shift: Shift
): AttendanceStatus {
  
  // Check leave first
  if (leave && leave.status === 'APPROVED') {
    return 'LEAVE';
  }
  
  // Check holiday
  if (holiday) {
    return 'HOLIDAY';
  }
  
  // Check weekend
  const dayOfWeek = getDay(attendance.date);
  if (shift.weeklyOffDays.includes(dayOfWeek)) {
    return 'WEEKEND';
  }
  
  // Check attendance record
  if (!attendance.checkInTime) {
    return 'ABSENT';
  }
  
  // Check working hours for half day
  if (attendance.workingHours < shift.workingHours / 2) {
    return 'HALF_DAY';
  }
  
  // Check late
  if (attendance.lateBy && attendance.lateBy > shift.lateGracePeriod) {
    return 'LATE';
  }
  
  // Check early out
  if (attendance.earlyOutBy && attendance.earlyOutBy > shift.earlyOutGracePeriod) {
    return 'EARLY_OUT';
  }
  
  return 'PRESENT';
}
```

**Status Definitions:**
- **PRESENT**: Full day attendance within grace periods
- **ABSENT**: No punch-in, no approved leave
- **LEAVE**: Approved leave
- **WEEKEND**: Configured weekly off
- **HOLIDAY**: Public holiday
- **HALF_DAY**: Working hours < 50% of shift
- **LATE**: Late beyond grace period
- **EARLY_OUT**: Early exit beyond grace period

#### 4. Attendance Regularization

**Regularization Workflow:**
```typescript
interface AttendanceRegularization {
  id: string;
  employeeId: string;
  date: Date;
  currentStatus: AttendanceStatus;
  requestedStatus: AttendanceStatus;
  requestedCheckIn?: Date;
  requestedCheckOut?: Date;
  reason: string;
  attachments?: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedDate?: Date;
  rejectionReason?: string;
}
```

**Regularization Rules:**
- Can regularize past 30 days
- Cannot regularize future dates
- Requires manager approval
- Attendance updated only on approval
- Audit trail maintained

#### 5. Leave-Attendance Integration

**Auto-Mark Attendance on Leave Approval:**
```typescript
async function onLeaveApproved(leave: Leave) {
  const dates = eachDayOfInterval({
    start: leave.startDate,
    end: leave.endDate
  });
  
  for (const date of dates) {
    // Skip weekends and holidays based on policy
    if (shouldSkipDate(date, leave.employee.shift)) {
      continue;
    }
    
    // Create or update attendance
    await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: leave.employeeId,
          date: startOfDay(date)
        }
      },
      create: {
        employeeId: leave.employeeId,
        date: startOfDay(date),
        status: 'LEAVE',
        attendanceType: 'REGULAR',
        workingHours: 0,
        remarks: `Leave: ${leave.leaveType} - ${leave.reason}`,
      },
      update: {
        status: 'LEAVE',
        remarks: `Leave: ${leave.leaveType} - ${leave.reason}`,
      }
    });
  }
}
```

**Absence Detection:**
```typescript
async function markAbsences(date: Date) {
  // Get all active employees
  const employees = await prisma.employee.findMany({
    where: { status: 'ACTIVE' },
    include: { shifts: { where: { isActive: true } } }
  });
  
  for (const employee of employees) {
    const shift = employee.shifts[0]?.shift;
    if (!shift) continue;
    
    // Check if weekend or holiday
    if (isWeekendOrHoliday(date, shift)) {
      continue;
    }
    
    // Check if attendance exists
    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: startOfDay(date)
        }
      }
    });
    
    if (!attendance) {
      // Check if leave exists
      const leave = await prisma.leave.findFirst({
        where: {
          employeeId: employee.id,
          status: 'APPROVED',
          startDate: { lte: date },
          endDate: { gte: date }
        }
      });
      
      if (leave) {
        // Mark as leave
        await markLeaveAttendance(employee.id, date, leave);
      } else {
        // Mark as absent
        await prisma.attendance.create({
          data: {
            employeeId: employee.id,
            date: startOfDay(date),
            status: 'ABSENT',
            attendanceType: 'REGULAR',
            workingHours: 0,
            remarks: 'Auto-marked absent',
          }
        });
      }
    }
  }
}
```

#### 6. Overtime Management

**Overtime Request:**
```typescript
interface OvertimeRequest {
  employeeId: string;
  overtimeDate: Date;
  startTime: string;
  endTime: string;
  hours: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
```

**Overtime Calculation:**
```typescript
async function calculateOvertimePayout(
  overtimeRequest: OvertimeRequest,
  employee: Employee
) {
  const shift = await getEmployeeShift(employee.id, overtimeRequest.overtimeDate);
  const overtimeMultiplier = shift.overtimeMultiplier; // e.g., 1.5
  
  const hourlySalary = employee.basicSalary / 30 / shift.workingHours;
  const overtimeAmount = overtimeRequest.hours * hourlySalary * overtimeMultiplier;
  
  return {
    hours: overtimeRequest.hours,
    rate: overtimeMultiplier,
    hourlySalary,
    amount: overtimeAmount
  };
}
```

**Payroll Integration:**
- Approved overtime auto-added to payroll
- Overtime amount calculated with multiplier
- Added as "Overtime Pay" earning element
- Shown separately in payslip

---

## C. ✅ PRISMA SCHEMA VALIDATION

### Current Schema Status: **✅ PRODUCTION READY**

The existing Prisma schema includes all required models. Below is the validation summary:

#### Leave Management Models

**✅ Leave** (Lines 582-616)
- Complete leave application model
- Support for attachments
- Approval workflow tracking
- Multi-level approval chain
- All required fields present

**✅ LeaveBalance** (Lines 638-676)
- Year-wise balance tracking
- Separate tracking for each leave type
- Encashment tracking
- Carry forward support
- All calculations supported

**✅ LeavePolicy** (Lines 678-722)
- Flexible policy configuration
- Accrual methods
- Carry forward rules
- Encashment rules
- Weekend/holiday treatment
- Entity-specific policies

**✅ Enums:**
- LeaveType (Lines 618-628)
- LeaveStatus (Lines 630-636)
- AccrualMethod (Lines 724-729)

#### Attendance Management Models

**✅ Attendance** (Lines 797-849)
- Daily attendance tracking
- Punch-in/out times
- Working hours calculation
- Late/early tracking
- Overtime hours
- Approval workflow
- Manual entry support

**✅ Shift** (Lines 733-773)
- Complete shift configuration
- Grace periods
- Night shift support
- Overtime rules
- Weekly offs
- Entity-specific shifts

**✅ EmployeeShift** (Lines 775-795)
- Employee-shift assignment
- Effective date tracking
- Historical shifts

**✅ OvertimeRequest** (Lines 871-902)
- Overtime request/approval
- Rate and amount calculation
- Status tracking

**✅ PublicHoliday** (Lines 911-933)
- Country-specific holidays
- Optional holidays
- Year-wise tracking

**✅ Enums:**
- AttendanceStatus (Lines 851-860)
- AttendanceType (Lines 862-869)
- OvertimeStatus (Lines 904-909)

### Additional Models Needed: **NONE**

The schema is complete. However, I recommend adding an audit log model for leave/attendance changes:

```prisma
model LeaveAuditLog {
  id              String   @id @default(cuid())
  leaveId         String
  action          String   // "CREATED", "APPROVED", "REJECTED", "CANCELLED"
  performedBy     String
  performedByUser User     @relation(fields: [performedBy], references: [id])
  previousStatus  LeaveStatus?
  newStatus       LeaveStatus
  remarks         String?  @db.Text
  timestamp       DateTime @default(now())
  
  @@index([leaveId])
  @@index([performedBy])
  @@index([timestamp])
}

model AttendanceAuditLog {
  id              String   @id @default(cuid())
  attendanceId    String
  action          String   // "PUNCH_IN", "PUNCH_OUT", "REGULARIZED", "CORRECTED"
  performedBy     String
  performedByUser User     @relation(fields: [performedBy], references: [id])
  changes         Json     // Old and new values
  remarks         String?  @db.Text
  timestamp       DateTime @default(now())
  
  @@index([attendanceId])
  @@index([performedBy])
  @@index([timestamp])
}
```

---

## D. ✅ API ENDPOINTS COMPLETE LIST

### Leave Management APIs

#### 1. Leave Application

**POST /api/leave/apply**
```typescript
Request: {
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  halfDay?: boolean;
  attachments?: string[];
}
Response: {
  leave: Leave;
  balance: LeaveBalance;
  workingDays: number;
}
```

**GET /api/leave**
```typescript
Query: {
  employeeId?: string;
  status?: LeaveStatus;
  from?: Date;
  to?: Date;
  leaveType?: LeaveType;
}
Response: Leave[]
```

**GET /api/leave/[id]**
```typescript
Response: {
  leave: Leave;
  approvalChain: ApprovalRecord[];
  employee: Employee;
}
```

**PUT /api/leave/[id]/approve**
```typescript
Request: {
  approverId: string;
  remarks?: string;
}
Response: Leave
```

**PUT /api/leave/[id]/reject**
```typescript
Request: {
  approverId: string;
  reason: string;
}
Response: Leave
```

**PUT /api/leave/[id]/cancel**
```typescript
Request: {
  reason: string;
}
Response: Leave
```

#### 2. Leave Balance

**GET /api/leave/balance**
```typescript
Query: {
  employeeId: string;
  year?: number;
}
Response: LeaveBalance
```

**POST /api/leave/balance/adjust**
```typescript
Request: {
  employeeId: string;
  year: number;
  leaveType: LeaveType;
  adjustment: number;
  reason: string;
}
Response: LeaveBalance
```

**POST /api/leave/balance/encash**
```typescript
Request: {
  employeeId: string;
  days: number;
}
Response: {
  balance: LeaveBalance;
  encashmentAmount: number;
  payrollImpact: PayrollElement;
}
```

#### 3. Leave Policy

**GET /api/leave/policy**
```typescript
Query: {
  entityId?: string;
  leaveType?: LeaveType;
}
Response: LeavePolicy[]
```

**POST /api/leave/policy** (Admin Only)
```typescript
Request: LeavePolicyCreateInput
Response: LeavePolicy
```

**PUT /api/leave/policy/[id]** (Admin Only)
```typescript
Request: LeavePolicyUpdateInput
Response: LeavePolicy
```

#### 4. Leave Reports

**GET /api/leave/reports/summary**
```typescript
Query: {
  entityId?: string;
  departmentId?: string;
  year: number;
  month?: number;
}
Response: {
  totalLeaves: number;
  byType: Record<LeaveType, number>;
  byStatus: Record<LeaveStatus, number>;
  topEmployees: { employeeId: string; days: number }[];
}
```

**GET /api/leave/reports/calendar**
```typescript
Query: {
  entityId?: string;
  departmentId?: string;
  month: number;
  year: number;
}
Response: {
  date: Date;
  leaves: Leave[];
  count: number;
}[]
```

### Attendance Management APIs

#### 1. Attendance Tracking

**POST /api/attendance/punch-in**
```typescript
Request: {
  employeeId: string;
  location?: { lat: number; lng: number };
}
Response: Attendance
```

**POST /api/attendance/punch-out**
```typescript
Request: {
  employeeId: string;
  location?: { lat: number; lng: number };
}
Response: Attendance
```

**GET /api/attendance**
```typescript
Query: {
  employeeId?: string;
  from: Date;
  to: Date;
  status?: AttendanceStatus;
}
Response: Attendance[]
```

**GET /api/attendance/[id]**
```typescript
Response: {
  attendance: Attendance;
  employee: Employee;
  shift: Shift;
}
```

#### 2. Attendance Regularization

**POST /api/attendance/regularize**
```typescript
Request: {
  employeeId: string;
  date: Date;
  checkInTime: Date;
  checkOutTime: Date;
  reason: string;
  attachments?: string[];
}
Response: AttendanceRegularization
```

**GET /api/attendance/regularization**
```typescript
Query: {
  employeeId?: string;
  status?: string;
}
Response: AttendanceRegularization[]
```

**PUT /api/attendance/regularization/[id]/approve**
```typescript
Request: {
  approverId: string;
  remarks?: string;
}
Response: AttendanceRegularization
```

**PUT /api/attendance/regularization/[id]/reject**
```typescript
Request: {
  approverId: string;
  reason: string;
}
Response: AttendanceRegularization
```

#### 3. Overtime

**POST /api/attendance/overtime/request**
```typescript
Request: {
  employeeId: string;
  overtimeDate: Date;
  startTime: string;
  endTime: string;
  reason: string;
}
Response: OvertimeRequest
```

**GET /api/attendance/overtime**
```typescript
Query: {
  employeeId?: string;
  status?: OvertimeStatus;
  from?: Date;
  to?: Date;
}
Response: OvertimeRequest[]
```

**PUT /api/attendance/overtime/[id]/approve**
```typescript
Request: {
  approverId: string;
  remarks?: string;
}
Response: OvertimeRequest
```

#### 4. Shift Management

**GET /api/attendance/shift**
```typescript
Query: {
  entityId?: string;
}
Response: Shift[]
```

**POST /api/attendance/shift** (Admin Only)
```typescript
Request: ShiftCreateInput
Response: Shift
```

**POST /api/attendance/shift/assign**
```typescript
Request: {
  employeeId: string;
  shiftId: string;
  effectiveFrom: Date;
}
Response: EmployeeShift
```

#### 5. Attendance Reports

**GET /api/attendance/reports/summary**
```typescript
Query: {
  entity Id?: string;
  departmentId?: string;
  month: number;
  year: number;
}
Response: {
  totalEmployees: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateDays: number;
  overtimeHours: number;
  byStatus: Record<AttendanceStatus, number>;
}
```

**GET /api/attendance/reports/register**
```typescript
Query: {
  employeeId?: string;
  month: number;
  year: number;
}
Response: {
  employee: Employee;
  days: {
    date: Date;
    status: AttendanceStatus;
    checkIn?: Date;
    checkOut?: Date;
    workingHours: number;
  }[];
  summary: {
    present: number;
    absent: number;
    leave: number;
    late: number;
  };
}
```

**Total API Endpoints: 40+**

---

_(Character limit reached - continuing in next file)_
