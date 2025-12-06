// app/dashboard/payroll/page.tsx
import React from 'react';
import { prisma } from '@/lib/prisma';

// If this page must be fresh per-request (user-specific), keep dynamic. Otherwise remove.
export const dynamic = 'force-dynamic';

export default async function PayrollDashboardPage() {
  try {
    const payrollRuns = await prisma.payrollRun.findMany({ orderBy: { created_at: 'desc' }, take: 20 });

    if (!payrollRuns || payrollRuns.length === 0) {
      return <div className="p-6">No payroll runs found.</div>;
    }

    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Payroll Runs</h1>
        <ul>
          {payrollRuns.map(run => (
            <li key={run.id} className="mb-2">
              <div>{`Run ${run.id} - ${run.month}/${run.year}`}</div>
              <div className="text-sm text-muted">{new Date(run.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (err) {
    console.error('PAYROLL PAGE ERROR', err);
    return <div className="p-6">Unable to load payroll runs.</div>;
  }
}
