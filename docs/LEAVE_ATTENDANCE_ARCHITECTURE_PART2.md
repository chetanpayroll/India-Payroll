# ═══════════════════════════════════════════════════════════════════
# LEAVE & ATTENDANCE ARCHITECTURE - PART 2
# Frontend, RBAC, Testing, Deployment & Risk Management
# ═══════════════════════════════════════════════════════════════════

## E. ✅ FRONTEND PAGE MAP

### Employee Portal

#### 1. **Leave Management Pages**

**`/dashboard/leave`** - Main Leave Dashboard
- My Leave Balance Card (Annual, Sick, etc.)
- Apply Leave Button (Primary CTA)
- Upcoming Leaves Calendar
- Recent Leave Applications List
- Leave History Table (Paginated)
- Quick Stats (Pending, Approved, Rejected)

**`/dashboard/leave/apply`** - Apply for Leave
- Leave Type Selector (Dropdown)
- Date Range Picker (with calendar)
- Half Day Option (Toggle)
- Reason Text Area
- Attachment Upload (Medical Certificate, etc.)
- Balance Preview (Real-time calculation)
- Submit Button

**`/dashboard/leave/history`** - Leave History
- Filter by Status, Type, Date Range
- Table with columns:
  - Leave Type
  - Dates
  - Days
  - Status (Badge)
  - Applied On
  - Approver
  - Actions (View, Cancel)
- Pagination
- Export to Excel/PDF

**`/dashboard/leave/balance`** - Leave Balance Details
- Year Selector
- Balance Cards for Each Leave Type:
  - Opening Balance
  - Accrued
  - Taken
  - Encashed
  - Remaining
  - Carry Forward (from previous year)
- Graphical representation (Bar chart)
- Accrual breakdown (Monthly)

**`/dashboard/leave/calendar`** - Team Leave Calendar
- Monthly calendar view
- Color-coded leave types
- Team members' leaves
- Holiday markers
- Click on date to view details

#### 2. **Attendance Management Pages**

**`/dashboard/attendance`** - Attendance Dashboard
- Punch-In / Punch-Out Cards
  - Current time
  - Last punch time
  - Location capture
  - Big action buttons
- Today's Status Card
- Monthly Summary Cards:
  - Present Days
  - Absent Days
  - Late Days
  - Leave Days
- Recent Punch History

**`/dashboard/attendance/history`** - Attendance History
- Month/Year Selector
- Attendance Register Table:
  - Date
  - Status (Badge)
  - Check-In
  - Check-Out
  - Working Hours
  - Late/Early (if applicable)
  - Remarks
- Summary Footer
- Export to Excel

**`/dashboard/attendance/regularize`** - Attendance Regularization
- Date Selector (Past 30 days)
- Current Status Display
- Requested Status Selector
- Check-In Time Picker
- Check-Out Time Picker
- Reason Text Area
- Attachment Upload
- Submit for Approval

**`/dashboard/attendance/overtime`** - Overtime Dashboard
- Request Overtime Button
- Pending Requests Table
- Approved Overtime (Monthly summary)
- Overtime Hours Graph (Last 6 months)
- Apply Overtime Modal:
  - Overtime Date
  - Start/End Time
  - Reason
  - Submit

### Manager Portal

#### 3. **Approval Pages**

**`/dashboard/approvals`** - Unified Approval Center
- Tabs:
  - Leave Approvals
  - Attendance Regularizations
  - Overtime Requests
- Pending Count Badges
- Filter by Employee, Type, Date
- Bulk Approve/Reject

**`/dashboard/approvals/leave`** - Leave Approvals
- Pending Leave Requests Table:
  - Employee Name + Photo
  - Leave Type (Badge)
  - Dates
  - Days
  - Reason
  - Applied On
  - Current Balance
  - Actions (Approve/Reject)
- Click row to view details modal
- Approve with remarks
- Reject with reason (mandatory)

**`/dashboard/approvals/attendance`** - Attendance Regularizations
- Pending Regularizations Table:
  - Employee
  - Date
  - Current Status
  - Requested Status
  - Reason
  - Actions
- View original vs requested times
- Attachment preview
- Approve/Reject actions


**`/dashboard/team/leave-calendar`** - Team Leave Planner
- Calendar view
- Team roster
- Leave distribution
- Workload analysis
- Prevent team conflicts

**`/dashboard/team/attendance-report`** - Team Attendance
- Filter by employee, date range
- Summary cards
- Detailed table
- Late coming analysis
- Absence trends

### Admin/HR Portal

#### 4. **Leave Administration**

**`/dashboard/admin/leave/policies`** - Leave Policies
- Entity Selector
- Leave Type Tabs (Annual, Sick, etc.)
- Policy Configuration Form:
  - Entitlement Days
  - Accrual Method
  - Carry Forward Rules
  - Encashment Rules
  - Restrictions
- Save/Update Button
- Audit Log

**`/dashboard/admin/leave/balances`** - Manage Leave Balances
- Employee Search/Filter
- Year Selector
- Balance Table with inline edit:
  - Employee
  - Annual (Entitled/Taken/Balance)
  - Sick (Entitled/Taken/Balance)
  - Other Types
  - Actions (Adjust)
- Bulk Upload (CSV)
- Adjustment Modal:
  - Adjustment Type (Add/Deduct)
  - Days
  - Reason
  - Effective Date

**`/dashboard/admin/leave/adjustments`** - Leave Adjustments History
- Filter by employee, type, date
- Adjustments table:
  - Date
  - Employee
  - Leave Type
  - Adjustment (+/-)
  - Days
  - Reason
  - Adjusted By
- Audit trail
- Reversal option

#### 5. **Attendance Administration**

**`/dashboard/admin/attendance/shifts`** - Shift Management
- Shifts List:
  - Shift Code
  - Shift Name
  - Timing
  - Working Hours
  - Active Status
  - Actions (Edit, Deactivate)
- Add Shift Button
- Shift Configuration Modal

**`/dashboard/admin/attendance/assign`** - Assign Shifts
- Employee Selector
- Current Shift Display
- New Shift Selector
- Effective From Date
- Historical Assignments Table
- Bulk Assignment (CSV upload)

**`/dashboard/admin/attendance/holidays`** - Public Holidays
- Year Selector
- Country/Entity Filter
- Holidays Table:
  - Date
  - Holiday Name
  - Optional/Mandatory
  - Country
  - Actions (Edit, Delete)
- Add Holiday Button
- Import from Template

**`/dashboard/admin/attendance/corrections`** - Attendance Corrections
- Search employee
- Select date range
- Corrections table:
  - Date
  - Employee
  - Current Status
  - Corrected Status
  - Reason
  - Corrected By
  - Date
- Manual correction form
- Audit log

#### 6. **Reports**

**`/dashboard/reports/leave`** - Leave Reports
- Report Type Selector:
  - Leave Summary
  - Leave Register
  - Balance Sheet
  - Encashment Report
- Filter Options:
  - Entity
  - Department
  - Employee
  - Date Range
  - Leave Type
- Visual Analytics:
  - Leave distribution pie chart
  - Monthly trend line chart
  - Department comparison bar chart
- Export (Excel, PDF)

**`/dashboard/reports/attendance`** - Attendance Reports
- Report Type Selector:
  - Attendance Summary
  - Attendance Register
  - Late Coming Report
  - Overtime Report
  - Absenteeism Report
- Filter Options:
  - Entity
  - Department
  - Employee
  - Date Range
- Visual Analytics:
  - Attendance rate gauge
  - Monthly trend
  - Department comparison
- Export (Excel, PDF)

**`/dashboard/reports/payroll-impact`** - Payroll Impact Report
- Month/Year Selector
- Payroll Run Selector
- Impact Summary Cards:
  - Total LOP Amount
  - Total Overtime Amount
  - Total Encashment Amount
  - Net Impact
- Detailed Breakdown Table:
  - Employee
  - LOP Days
  - LOP Amount
  - Overtime Hours
  - Overtime Amount
  - Encashment Days
  - Encashment Amount
  - Net Impact
- Export for payroll processing

### Total Pages: **25+ Production-Ready Pages**

---

## F. ✅ PAYROLL INTEGRATION LOGIC

### Leave-Payroll Integration

#### 1. LOP (Leave Without Pay) Calculation

```typescript
interface LOPCalculation {
  employeeId: string;
  month: number;
  year: number;
  lopDays: number;
  dailySalary: number;
  lopAmount: number;
}

async function calculateLOP(
  employeeId: string,
  month: number,
  year: number
): Promise<LOPCalculation> {
  
  // Get all absences without approved leave
  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);
  
  const attendances = await prisma.attendance.findMany({
    where: {
      employeeId,
      date: { gte: startDate, lte: endDate },
      status: 'ABSENT'
    }
  });
  
  // Get unpaid leaves
  const unpaidLeaves = await prisma.leave.findMany({
    where: {
      employeeId,
      leaveType: 'UNPAID',
      status: 'APPROVED',
      startDate: { lte: endDate },
      endDate: { gte: startDate }
    }
  });
  
  // Calculate total LOP days
  let lopDays = attendances.length;
  for (const leave of unpaidLeaves) {
    lopDays += calculateWorkingDays(leave.startDate, leave.endDate);
  }
  
  // Get employee salary
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId }
  });
  
  const dailySalary = Number(employee.basicSalary) / 30;
  const lopAmount = lopDays * dailySalary;
  
  return {
    employeeId,
    month,
    year,
    lopDays,
    dailySalary,
    lopAmount
  };
}
```

#### 2. Leave Encashment Processing

```typescript
interface EncashmentCalculation {
  employeeId: string;
  year: number;
  encashmentDays: number;
  dailySalary: number;
  encashmentRate: number; // Multiplier
  encashmentAmount: number;
  taxableAmount: number;
}

async function processLeaveEncashment(
  employeeId: string,
  requestedDays: number
): Promise<EncashmentCalculation> {
  
  const currentYear = new Date().getFullYear();
  
  // Get leave balance
  const balance = await prisma.leaveBalance.findUnique({
    where: {
      employeeId_year: {
        employeeId,
        year: currentYear
      }
    }
  });
  
  //

Get leave policy
  const policy = await prisma.leavePolicy.findFirst({
    where: {
      leaveType: 'ANNUAL',
      isActive: true
    }
  });
  
  // Validate encashment
  if (!policy.allowEncashment) {
    throw new Error('Leave encashment not allowed');
  }
  
  const maxEncashable = Math.min(
    policy.maxEncashmentDays,
    balance.annualLeaveBalance
  );
  
  if (requestedDays > maxEncashable) {
    throw new Error(`Maximum ${maxEncashable} days can be encashed`);
  }
  
  // Get employee salary
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId }
  });
  
  const dailySalary = Number(employee.basicSalary) / 30;
  const encashmentRate = Number(policy.encashmentRate);
  const encashmentAmount = requestedDays * dailySalary * encashmentRate;
  
  // Update balance
  await prisma.leaveBalance.update({
    where: { id: balance.id },
    data: {
      annualLeaveBalance: {
        decrement: requestedDays
      },
      leaveEncashed: {
        increment: requestedDays
      },
      encashmentAmount: {
        increment: encashmentAmount
      }
    }
  });
  
  return {
    employeeId,
    year: currentYear,
    encashmentDays: requestedDays,
    dailySalary,
    encashmentRate,
    encashmentAmount,
    taxableAmount: encashmentAmount // Country-specific tax rules apply
  };
}
```

### Attendance-Payroll Integration

#### 3. Overtime Payout Calculation

```typescript
interface OvertimeCalculation {
  employeeId: string;
  month: number;
  year: number;
  totalOvertimeHours: number;
  overtimeRate: number;
  hourlySalary: number;
  overtimeAmount: number;
}

async function calculateOvertimePayout(
  employeeId: string,
  month: number,
  year: number
): Promise<OvertimeCalculation> {
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);
  
  //Get approved overtime requests
  const overtimeRequests = await prisma.overtimeRequest.findMany({
    where: {
      employeeId,
      overtimeDate: { gte: startDate, lte: endDate },
      status: 'APPROVED'
    }
  });
  
  const totalOvertimeHours = overtimeRequests.reduce(
    (sum, req) => sum + Number(req.hours),
    0
  );
  
  // Get employee details
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      shifts: {
        where: { isActive: true },
        include: { shift: true }
      }
    }
  });
  
  const shift = employee.shifts[0]?.shift;
  const overtimeRate = Number(shift?.overtimeMultiplier || 1.5);
  
  const dailySalary = Number(employee.basicSalary) / 30;
  const hourlySalary = dailySalary / Number(shift.workingHours);
  const overtimeAmount = totalOvertimeHours * hourlySalary * overtimeRate;
  
  return {
    employeeId,
    month,
    year,
    totalOvertimeHours,
    overtimeRate,
    hourlySalary,
    overtimeAmount
  };
}
```

#### 4. Attendance-Based Proration

```typescript
interface AttendanceProration {
  employeeId: string;
  month: number;
  year: number;
  totalDays: number; // Days in month
  workingDays: number; // Expected working days (excl weekends/holidays)
  actualPresentDays: number;
  absentDays: number;
  lopDays: number;
  proratedSalary: number;
  fullSalary: number;
  deduction: number;
}

async function calculateAttendanceProration(
  employeeId: string,
  month: number,
  year: number
): Promise<AttendanceProration> {
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);
  const totalDays = endDate.getDate();
  
  // Get all attendances for the month
  const attendances = await prisma.attendance.findMany({
    where: {
      employeeId,
      date: { gte: startDate, lte: endDate }
    }
  });
  
  // Count working days (exclude weekends and holidays)
  const workingDays = attendances.filter(a => 
    a.status !== 'WEEKEND' && a.status !== 'HOLIDAY'
  ).length;
  
  // Count present days
  const presentDays = attendances.filter(a => 
    a.status === 'PRESENT' || a.status === 'LEAVE' || a.status === 'HALF_DAY'
  ).length;
  
  // Count LOP days (absences without leave)
  const lopDays = attendances.filter(a => 
    a.status === 'ABSENT'
  ).length;
  
  // Get employee salary
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId }
  });
  
  const fullSalary = Number(employee.basicSalary);
  const dailySalary = fullSalary / 30; // Standard 30-day month
  const deduction = lopDays * dailySalary;
  const proratedSalary = fullSalary - deduction;
  
  return {
    employeeId,
    month,
    year,
    totalDays,
    workingDays,
    actualPresentDays: presentDays,
    absentDays: workingDays - presentDays,
    lopDays,
    proratedSalary,
    fullSalary,
    deduction
  };
}
```

#### 5. Payroll Run Integration

```typescript
async function processPayrollWithLeaveAttendance(
  payrollRunId: string
): Promise<void> {
  
  const payrollRun = await prisma.payrollRun.findUnique({
    where: { id: payrollRunId },
    include: { payrollItems: true }
  });
  
  for (const item of payrollRun.payrollItems) {
    const employeeId = item.employeeId;
    const month = payrollRun.payrollMonth;
    const year = payrollRun.payrollYear;
    
    // Calculate LOP
    const lop = await calculateLOP(employeeId, month, year);
    
    // Calculate overtime
    const overtime = await calculateOvertimePayout(employeeId, month, year);
    
    // Calculate proration
    const proration = await calculateAttendanceProration(employeeId, month, year);
    
    // Get encashment (if any)
    const encashment = await getEncashmentForMonth(employeeId, month, year);
    
    // Update payroll item
    await prisma.payrollItem.update({
      where: { id: item.id },
      data: {
        workingDays: proration.actualPresentDays,
        actualDays: 30, // Standard month
        basicSalary: item.basicSalary, // From employee master
        grossSalary: {
          increment: overtime.overtimeAmount + (encashment?.encashmentAmount || 0)
        },
        totalDeductions: {
          increment: lop.lopAmount
        },
        netSalary: {
          set: item.grossSalary + overtime.overtimeAmount + (encashment?.encashmentAmount || 0) - lop.lopAmount - item.totalDeductions
        }
      }
    });
    
    // Create payroll item elements
    if (lop.lopAmount > 0) {
      await createPayrollElement(item.id, 'LOP_DEDUCTION', -lop.lopAmount);
    }
    
    if (overtime.overtimeAmount > 0) {
      await createPayrollElement(item.id, 'OVERTIME_PAY', overtime.overtimeAmount);
    }
    
    if (encashment && encashment.encashmentAmount > 0) {
      await createPayrollElement(item.id, 'LEAVE_ENCASHMENT', encashment.encashmentAmount);
    }
  }
}
```

---

## G. ✅ RBAC MATRIX

### Role-Based Access Control

| Feature | Employee | Manager | HR Manager | Payroll Admin | Super Admin |
|---------|----------|---------|------------|---------------|-------------|
| **Leave - Apply** | ✅ Own only | ✅ Own only | ✅ Own only | ✅ Own only | ✅ Full access |
| **Leave - View** | ✅ Own only | ✅ Team + Own | ✅ Entity-wide | ✅ Entity-wide | ✅ All |
| **Leave - Approve** | ❌ | ✅ Team only | ✅ All | ❌ | ✅ All |
| **Leave - Reject** | ❌ | ✅ Team only | ✅ All | ❌ | ✅ All |
| **Leave - Cancel** | ✅ Own (pending) | ✅ Team (approved) | ✅ All | ❌ | ✅ All |
| **Leave - Balance View** | ✅ Own only | ✅ Team + Own | ✅ All | ✅ All | ✅ All |
| **Leave - Balance Adjust** | ❌ | ❌ | ✅ All | ❌ | ✅ All |
| **Leave - Encash Request** | ✅ Own only | ✅ Own only | ✅ All | ❌ | ✅ All |
| **Leave - Policy Config** | ❌ (View only) | ❌ (View only) | ✅ Edit | ❌ (View only) | ✅ Edit |
| **Leave - Reports** | ✅ Own only | ✅ Team only | ✅ All | ✅ All | ✅ All |
| | | | | | |
| **Attendance - Punch In/Out** | ✅ Own only | ✅ Own only | ✅ Own only | ✅ Own only | ✅ Full access |
| **Attendance - View** | ✅ Own only | ✅ Team + Own | ✅ Entity-wide | ✅ Entity-wide | ✅ All |
| **Attendance - Regularize** | ✅ Own only | ✅ Own only | ✅ Own only | ❌ | ✅ All |
| **Attendance - Approve Reg.** | ❌ | ✅ Team only | ✅ All | ❌ | ✅ All |
| **Attendance - Manual Correct** | ❌ | ❌ | ✅ All | ❌ | ✅ All |
| **Attendance - Overtime Request** | ✅ Own only | ✅ Own only | ✅ Own only | ❌ | ✅ All |
| **Attendance - Approve Overtime** | ❌ | ✅ Team only | ✅ All | ❌ | ✅ All |
| **Attendance - Shift View** | ✅ Own only | ✅ Team + Own | ✅ All | ❌ | ✅ All |
| **Attendance - Shift Config** | ❌ | ❌ | ✅ Edit | ❌ | ✅ Edit |
| **Attendance - Shift Assign** | ❌ | ❌ | ✅ Assign | ❌ | ✅ Assign |
| **Attendance - Reports** | ✅ Own only | ✅ Team only | ✅ All | ✅ All | ✅ All |
| | | | | | |
| **Payroll - View Impact** | ❌ | ❌ | ✅ All | ✅ All | ✅ All |
| **Payroll - Process** | ❌ | ❌ | ❌ | ✅ All | ✅ All |
| **Payroll - Reports** | ❌ | ❌ | ❌ (Summary) | ✅ All | ✅ All |

### API Authorization Middleware

```typescript
// lib/middleware/rbac.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type Permission = 'leave:apply' | 'leave:approve' | 'leave:adjust' | 'attendance:punch' | 'attendance:approve' | 'payroll:process';

const rolePermissions: Record<string, Permission[]> = {
  EMPLOYEE: [
    'leave:apply',
    'attendance:punch',
    'attendance:regularize',
    'overtime:request'
  ],
  MANAGER: [
    'leave:apply',
    'leave:approve',
    'attendance:punch',
    'attendance:approve',
    'overtime:approve'
  ],
  HR_MANAGER: [
    'leave:apply',
    'leave:approve',
    'leave:adjust',
    'leave:policy',
    'attendance:punch',
    'attendance:approve',
    'attendance:correct',
    'attendance:shift',
    'overtime:approve'
  ],
  ADMIN: ['*'], // All permissions
  SUPER_ADMIN: ['*']
};

export async function requirePermission(permission: Permission) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const userRole = session.user.role || 'EMPLOYEE';
  const permissions = rolePermissions[userRole] || [];
  
  if (!permissions.includes('*') && !permissions.includes(permission)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
  
  return session;
}
```

---

_(Continued in next artifact due to length...)_
