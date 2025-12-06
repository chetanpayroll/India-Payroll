# 📘 PayrollNexus-India: User Manual & Standard Operating Procedure (SOP)

## 🌟 Introduction
Welcome to **PayrollNexus-India**, your enterprise-grade payroll processing engine. This manual provides step-by-step instructions on how to set up your organization, onboard employees, and process payroll compliant with Indian statutory requirements.

---

## 🚀 1. Getting Started

### 1.1 Accessing the System
1.  Open your web browser and navigate to the application URL (e.g., `http://localhost:3001` or your production URL).
2.  **Login Credentials** (Demo Mode):
    *   **Email**: `demo@payrollnexus.com` (or any valid email format)
    *   **Password**: `demo` (or any password)
3.  Click **"Sign In"**. You will be redirected to the **Dashboard**.

---

## 🏢 2. Organization Setup (The Hierarchy)

The system follows a strict hierarchy: **Vendor (You) -> Client (Customer) -> Entity (Legal Company)**.

### 2.1 Step 1: Create a Vendor (Your Agency)
*If you are a payroll service provider, this is your own organization.*
1.  Navigate to **Settings > Vendors**.
2.  Click **"Add Vendor"**.
3.  **Code**: Enter a unique code (e.g., `V001`).
4.  **Name**: Enter your agency name (e.g., "Acme Payroll Services").
5.  **Save**.

### 2.2 Step 2: Onboard a Client
*A Client is a company you are processing payroll for.*
1.  Navigate to **Clients**.
2.  Click **"Add Client"**.
3.  **Vendor**: Select the Vendor created in Step 1.
4.  **Client Code**: Unique code (e.g., `CL_TATA`).
5.  **Name**: Client Name (e.g., "Tata Consultancy Services").
6.  **Pay Frequency**: Select `MONTHLY`.
7.  **Save**.

### 2.3 Step 3: Define Legal Entities
*A Client may have multiple legal entities (e.g., one in Maharashtra, one in Karnataka).*
1.  Click on the **Client Name** you just created.
2.  Go to the **"Entities"** tab.
3.  Click **"Add Entity"**.
4.  **Code**: Unique Entity Code (e.g., `ENT_MH`).
5.  **State**: **CRITICAL** - Select the correct state (e.g., "Maharashtra"). This determines Professional Tax (PT) rules.
6.  **Statutory Details**: Enter PF Code, ESI Code, PAN, and TAN.
7.  **Save**.

---

## 💰 3. Salary Configuration (Pay Elements)

Before adding employees, you must define the components of their salary (Earnings & Deductions).

### 3.1 Creating Pay Heads
1.  Navigate to **Settings > Pay Elements**.
2.  Click **"Add Pay Element"**.
3.  **Basic Salary**:
    *   Name: "Basic Salary"
    *   Type: `EARNING`
    *   Calculation: `FIXED` (or Formula)
    *   Taxable: `Yes`
    *   Part of Gross: `Yes`
4.  **HRA (House Rent Allowance)**:
    *   Name: "HRA"
    *   Type: `EARNING`
    *   Calculation: `FORMULA` -> `basic * 0.40` (40% of Basic)
5.  **Special Allowance**:
    *   Name: "Special Allowance"
    *   Type: `EARNING`
    *   Calculation: `FIXED` (Balancing figure)

*Note: Statutory deductions (EPF, ESI, PT, TDS) are calculated automatically by the system engine and do not need manual formulas.*

---

## 👥 4. Employee Management

### 4.1 Adding a New Employee
1.  Navigate to **Employees**.
2.  Click **"Add Employee"**.
3.  **Personal Details**:
    *   First Name, Last Name, Date of Birth, Gender.
    *   **Joining Date**: Crucial for prorated salary calculation.
4.  **Employment Details**:
    *   Select **Client** and **Entity**.
    *   **Employee Code**: Unique ID (e.g., `EMP001`).
5.  **Statutory Settings**:
    *   **PF Opted Out?**: Check if salary > ₹15,000 and employee opts out.
    *   **ESI Applicable?**: System auto-checks based on salary, but you can force disable.
    *   **PT Applicable?**: Usually `Yes`.
6.  **Salary Structure (CTC)**:
    *   Enter the **Monthly CTC** or **Gross Salary**.
    *   The system will auto-populate components based on the Pay Elements defined in Section 3.
7.  **Save**.

### 4.2 Bulk Import (Optional)
For many employees, use the **"Bulk Import"** button to upload a CSV file with employee details.

---

## ⚙️ 5. Running Payroll (The Monthly Cycle)

This is the core function you will perform every month.

### 5.1 Step 1: Create a Payroll Run
1.  Navigate to **Payroll**.
2.  Click **"New Payroll Run"**.
3.  **Select Entity**: Choose the legal entity (e.g., "Tata - Maharashtra").
4.  **Period**: Select Month (e.g., "April") and Year (e.g., "2024").
5.  Click **"Create Draft"**.

### 5.2 Step 2: Process & Calculate
1.  You will see the run in **DRAFT** status.
2.  Click **"Process Payroll"**.
3.  The engine will now:
    *   Calculate formulas for every employee.
    *   Compute EPF, ESI, PT based on state/central rules.
    *   Deduct TDS based on tax regime.
    *   Prorate salary if the employee joined mid-month.
4.  Wait for the status to change to **CALCULATED**.

### 5.3 Step 3: Verify & Validate
1.  Click **"View Line Items"**.
2.  Review the **Gross**, **Deductions**, and **Net Pay** for a few sample employees.
3.  Check for any errors (highlighted in red).

### 5.4 Step 4: Approval & Finalization
1.  Once verified, click **"Submit for Approval"**.
2.  A supervisor (or you) can then click **"Approve Run"**.
3.  Status changes to **APPROVED**. *Payroll is now locked.*

---

## 📄 6. Reports & Outputs

After approval, you can generate the required documents.

### 6.1 Payslips
1.  Go to **Payroll > [Select Run]**.
2.  Click **"Generate Payslips"**.
3.  Payslips are generated as PDFs and can be emailed to employees or downloaded.

### 6.2 Statutory Reports
1.  Navigate to **Reports**.
2.  **PF ECR**: Download the Electronic Challan Return text file for EPF portal upload.
3.  **ESI Return**: Download the Excel file for ESIC portal.
4.  **PT Report**: State-wise Professional Tax summary.

### 6.3 Bank Transfer File
1.  Go to **Reports > Bank File**.
2.  Select your bank format (e.g., HDFC, SBI, ICICI).
3.  Download the `.txt` or `.csv` file to upload to your corporate banking portal for salary disbursement.

---

## ❓ Frequently Asked Questions (SOP)

**Q: What if an employee leaves mid-month?**
A: Mark the employee status as **"Resigned"** and set the **"Last Working Day"** in the Employee profile. The payroll engine will automatically prorate the salary for the days worked.

**Q: How do I handle bonuses?**
A: Add a "One-time Payment" pay element to the specific employee's salary structure for that month before running the payroll.

**Q: Can I re-run payroll after approval?**
A: No. You must **"Rollback"** the run (if enabled) or process adjustments in the next month's payroll.

---

**End of SOP**
