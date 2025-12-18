-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'employee',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_by" TEXT
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "registration_number" TEXT,
    "pan" TEXT NOT NULL,
    "tan" TEXT,
    "gstin" TEXT,
    "pf_registration_number" TEXT,
    "pf_establishment_id" TEXT,
    "esic_registration_number" TEXT,
    "pt_registration_number" TEXT,
    "lwf_registration_number" TEXT,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal_code" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "bank_name" TEXT,
    "bank_account_number" TEXT,
    "bank_ifsc" TEXT,
    "bank_branch" TEXT,
    "industry" TEXT,
    "employee_count" INTEGER NOT NULL DEFAULT 0,
    "financial_year_start" INTEGER NOT NULL DEFAULT 4,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_by" TEXT,
    CONSTRAINT "companies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "companies_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "company_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "company_users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "company_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL,
    "employee_code" TEXT NOT NULL,
    "title" TEXT,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATETIME,
    "gender" TEXT,
    "marital_status" TEXT,
    "blood_group" TEXT,
    "email" TEXT,
    "personal_email" TEXT,
    "mobile" TEXT,
    "current_address_line1" TEXT,
    "current_city" TEXT,
    "date_of_joining" DATETIME NOT NULL,
    "date_of_leaving" DATETIME,
    "employment_type" TEXT NOT NULL DEFAULT 'Permanent',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "department" TEXT,
    "designation" TEXT,
    "work_location" TEXT,
    "reporting_manager_id" TEXT,
    "pan" TEXT,
    "aadhaar" TEXT,
    "uan" TEXT,
    "esic_ip_number" TEXT,
    "bank_account_number" TEXT,
    "bank_ifsc" TEXT,
    "bank_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "employees_reporting_manager_id_fkey" FOREIGN KEY ("reporting_manager_id") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "salary_structures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employee_id" TEXT NOT NULL,
    "effective_from" DATETIME NOT NULL,
    "effective_to" DATETIME,
    "basic_salary" REAL NOT NULL,
    "hra" REAL DEFAULT 0,
    "special_allowance" REAL DEFAULT 0,
    "transport_allowance" REAL DEFAULT 0,
    "medical_allowance" REAL DEFAULT 0,
    "lta" REAL DEFAULT 0,
    "other_allowances" REAL DEFAULT 0,
    "pf_applicable" BOOLEAN NOT NULL DEFAULT true,
    "esic_applicable" BOOLEAN NOT NULL DEFAULT false,
    "pt_applicable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "salary_structures_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employee_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "attendance_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "check_in_time" DATETIME,
    "check_out_time" DATETIME,
    "total_hours" REAL,
    "overtime_hours" REAL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attendance_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attendance_records_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leave_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "default_days_per_year" REAL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "leave_types_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employee_id" TEXT NOT NULL,
    "leave_type_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "opening_balance" REAL NOT NULL DEFAULT 0,
    "used" REAL NOT NULL DEFAULT 0,
    "credited" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "leave_balances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "leave_balances_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leave_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employee_id" TEXT NOT NULL,
    "leave_type_id" TEXT NOT NULL,
    "from_date" DATETIME NOT NULL,
    "to_date" DATETIME NOT NULL,
    "total_days" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    CONSTRAINT "leave_applications_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "leave_applications_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payroll_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "pay_period_start" DATETIME NOT NULL,
    "pay_period_end" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "total_employees" INTEGER,
    "total_gross" REAL,
    "total_deductions" REAL,
    "total_net_pay" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payroll_runs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payroll_details" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payroll_run_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "basic_salary" REAL DEFAULT 0,
    "hra" REAL DEFAULT 0,
    "special_allowance" REAL DEFAULT 0,
    "other_allowances" REAL DEFAULT 0,
    "gross_earnings" REAL,
    "pf_employee" REAL DEFAULT 0,
    "esic_employee" REAL DEFAULT 0,
    "professional_tax" REAL DEFAULT 0,
    "tds" REAL DEFAULT 0,
    "total_deductions" REAL,
    "net_pay" REAL,
    "payable_days" REAL,
    CONSTRAINT "payroll_details_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_runs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payroll_details_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employee_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "loan_amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    CONSTRAINT "loans_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "loans_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "loan_repayments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loan_id" TEXT NOT NULL,
    "repayment_date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    CONSTRAINT "loan_repayments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "investment_declarations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employee_id" TEXT NOT NULL,
    "financial_year" TEXT NOT NULL,
    "total_80c" REAL DEFAULT 0,
    "total_80d" REAL DEFAULT 0,
    "hra_annual_rent" REAL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    CONSTRAINT "investment_declarations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "compliance_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL,
    "compliance_type" TEXT NOT NULL,
    "period_month" INTEGER NOT NULL,
    "period_year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    CONSTRAINT "compliance_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT,
    "setting_key" TEXT NOT NULL,
    "setting_value" TEXT NOT NULL,
    CONSTRAINT "system_settings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "companies_pan_key" ON "companies"("pan");

-- CreateIndex
CREATE INDEX "companies_pan_idx" ON "companies"("pan");

-- CreateIndex
CREATE INDEX "companies_is_active_idx" ON "companies"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "company_users_company_id_user_id_key" ON "company_users"("company_id", "user_id");

-- CreateIndex
CREATE INDEX "employees_company_id_idx" ON "employees"("company_id");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "employees"("status");

-- CreateIndex
CREATE INDEX "employees_department_idx" ON "employees"("department");

-- CreateIndex
CREATE UNIQUE INDEX "employees_company_id_employee_code_key" ON "employees"("company_id", "employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "salary_structures_employee_id_key" ON "salary_structures"("employee_id");

-- CreateIndex
CREATE INDEX "salary_structures_effective_from_idx" ON "salary_structures"("effective_from");

-- CreateIndex
CREATE INDEX "attendance_records_company_id_attendance_date_idx" ON "attendance_records"("company_id", "attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_employee_id_attendance_date_key" ON "attendance_records"("employee_id", "attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_company_id_code_key" ON "leave_types"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_employee_id_leave_type_id_year_key" ON "leave_balances"("employee_id", "leave_type_id", "year");

-- CreateIndex
CREATE INDEX "leave_applications_employee_id_idx" ON "leave_applications"("employee_id");

-- CreateIndex
CREATE INDEX "leave_applications_status_idx" ON "leave_applications"("status");

-- CreateIndex
CREATE INDEX "payroll_runs_company_id_idx" ON "payroll_runs"("company_id");

-- CreateIndex
CREATE INDEX "payroll_runs_month_year_idx" ON "payroll_runs"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_details_payroll_run_id_employee_id_key" ON "payroll_details"("payroll_run_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "investment_declarations_employee_id_financial_year_key" ON "investment_declarations"("employee_id", "financial_year");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_company_id_setting_key_key" ON "system_settings"("company_id", "setting_key");
