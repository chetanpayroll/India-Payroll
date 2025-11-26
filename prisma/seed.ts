import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test employees
  const employee1 = await prisma.employee.create({
    data: {
      employeeNumber: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+971501234567',
      emiratesId: '784-1234-1234567-1',
      nationality: 'Indian',
      dateOfBirth: new Date('1990-01-15'),
      gender: 'MALE',
      maritalStatus: 'MARRIED',

      // Employment Details
      joiningDate: new Date('2023-01-01'),
      employmentType: 'FULL_TIME',
      designation: 'Software Engineer',
      department: 'Technology',
      reportingManager: null,
      workLocation: 'Dubai Office',

      // Salary Details
      basicSalary: 8000,
      housingAllowance: 2000,
      transportAllowance: 500,
      otherAllowances: 500,
      totalSalary: 11000,

      // Bank Details
      bankName: 'Emirates NBD',
      bankAccountNumber: '1234567890',
      iban: 'AE070331234567890',

      // Status
      status: 'ACTIVE',
      isActive: true,
    }
  })

  const employee2 = await prisma.employee.create({
    data: {
      employeeNumber: 'EMP002',
      firstName: 'Sarah',
      lastName: 'Smith',
      email: 'sarah.smith@example.com',
      phoneNumber: '+971507654321',
      emiratesId: '784-1234-7654321-2',
      nationality: 'British',
      dateOfBirth: new Date('1992-05-20'),
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',

      // Employment Details
      joiningDate: new Date('2023-03-15'),
      employmentType: 'FULL_TIME',
      designation: 'HR Manager',
      department: 'Human Resources',
      reportingManager: null,
      workLocation: 'Dubai Office',

      // Salary Details
      basicSalary: 10000,
      housingAllowance: 3000,
      transportAllowance: 800,
      otherAllowances: 700,
      totalSalary: 14500,

      // Bank Details
      bankName: 'ADCB',
      bankAccountNumber: '9876543210',
      iban: 'AE070339876543210',

      // Status
      status: 'ACTIVE',
      isActive: true,
    }
  })

  console.log('✅ Created employees:', employee1.employeeNumber, employee2.employeeNumber)

  // Create leave balances for current year
  const currentYear = new Date().getFullYear()

  const balance1 = await prisma.leaveBalance.create({
    data: {
      employeeId: employee1.id,
      year: currentYear,
      annualLeaveEntitled: 30,
      annualLeaveTaken: 0,
      annualLeaveBalance: 30,
      annualLeaveCarryForward: 0,
      sickLeaveEntitled: 15,
      sickLeaveTaken: 0,
      sickLeaveBalance: 15,
      unpaidLeaveTaken: 0,
      maternityLeaveTaken: 0,
      paternityLeaveTaken: 0,
      emergencyLeaveTaken: 0,
      leaveEncashed: 0,
      encashmentAmount: 0,
    }
  })

  const balance2 = await prisma.leaveBalance.create({
    data: {
      employeeId: employee2.id,
      year: currentYear,
      annualLeaveEntitled: 30,
      annualLeaveTaken: 5,
      annualLeaveBalance: 25,
      annualLeaveCarryForward: 3,
      sickLeaveEntitled: 15,
      sickLeaveTaken: 2,
      sickLeaveBalance: 13,
      unpaidLeaveTaken: 0,
      maternityLeaveTaken: 0,
      paternityLeaveTaken: 0,
      emergencyLeaveTaken: 0,
      leaveEncashed: 0,
      encashmentAmount: 0,
    }
  })

  console.log('✅ Created leave balances for year:', currentYear)

  // Create a sample leave request
  const leaveRequest = await prisma.leave.create({
    data: {
      employeeId: employee1.id,
      leaveType: 'ANNUAL',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-05'),
      numberOfDays: 5,
      reason: 'Family vacation',
      status: 'PENDING',
      appliedDate: new Date(),
    }
  })

  console.log('✅ Created sample leave request:', leaveRequest.id)

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📊 Summary:')
  console.log('  - Employees: 2')
  console.log('  - Leave Balances: 2')
  console.log('  - Leave Requests: 1')
  console.log('\n✨ You can now log in and test the Leave Management feature!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
