'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCountry } from '@/lib/context/CountryContext';

export default function CountrySelectPage() {
  const router = useRouter();
  const { setCountry } = useCountry();

  useEffect(() => {
    // Automatically set country to INDIA and redirect
    setCountry('INDIA');
    router.push('/dashboard/payroll/india');
  }, [setCountry, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Setting up India Environment...</h2>
        <p className="text-gray-500 mt-2">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}
