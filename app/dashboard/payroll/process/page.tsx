'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PayrollProcessPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/payroll/india/new');
  }, [router]);

  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-500">Redirecting to Payroll Process...</p>
      </div>
    </div>
  );
}
