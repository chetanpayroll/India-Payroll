// app/dashboard/payroll/page.tsx
import React from 'react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// If this page must be fresh per-request (user-specific), keep dynamic. Otherwise remove.
export const dynamic = 'force-dynamic';

export default async function PayrollDashboardPage() {
  let payrollRuns = [];

  try {
    // Note: Checking schema for 'created_at' vs 'createdAt'. 
    // Usually standard prisma convention is camelCase 'createdAt' but schema might have mapping.
    // Based on previous view, schema has `createdAt @map("created_at")` so we must use `createdAt` in queries.
    // The previous error might have been due to field name mismatch if `created_at` was used directly in orderBy.
    payrollRuns = await prisma.payrollRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        company: {
          select: {
            name: true
          }
        }
      }
    });

  } catch (err) {
    console.error('PAYROLL PAGE ERROR', err);
    // Silent fail to empty array for UI resilience
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Payroll Runs</h1>
        <Link href="/dashboard/payroll/new">
          <Button>Create New Run</Button>
        </Link>
      </div>

      {payrollRuns.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-4">No payroll runs found</p>
          <Link href="/dashboard/payroll/new">
            <Button variant="outline">Start Your First Payroll</Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-md">
          <ul className="divide-y">
            {payrollRuns.map(run => (
              <li key={run.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{`Payroll Run - ${run.month}/${run.year}`}</div>
                    <div className="text-sm text-gray-500">{run.company?.name}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(run.createdAt).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
