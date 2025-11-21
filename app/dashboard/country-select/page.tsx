'use client';

// ============================================================================
// COUNTRY SELECTION PAGE
// ============================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCountry } from '@/lib/context/CountryContext';
import { CountryCode } from '@/lib/payroll/core/types';
import { COUNTRY_CONFIGS } from '@/lib/payroll/core/countryConfig';

export default function CountrySelectPage() {
  const router = useRouter();
  const { setCountry, country: currentCountry } = useCountry();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(currentCountry);
  const [isLoading, setIsLoading] = useState(false);

  const countries = Object.values(COUNTRY_CONFIGS);

  const handleCountrySelect = (countryCode: CountryCode) => {
    setSelectedCountry(countryCode);
  };

  const handleContinue = async () => {
    if (!selectedCountry) return;

    setIsLoading(true);

    // Set the country in context
    setCountry(selectedCountry);

    // Small delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Navigate to the appropriate payroll page
    if (selectedCountry === 'INDIA') {
      router.push('/dashboard/payroll/india');
    } else {
      router.push('/dashboard/payroll');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Select Your Country
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the country for payroll processing. Each country has specific tax rules,
            statutory compliance requirements, and salary structures.
          </p>
        </div>

        {/* Country Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {countries.map((config) => {
            const isSelected = selectedCountry === config.code;
            const isUAE = config.code === 'UAE';

            return (
              <button
                key={config.code}
                onClick={() => handleCountrySelect(config.code)}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-300
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100 scale-[1.02]'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }
                  text-left group
                `}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Flag and Name */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{config.uiConfig.flagEmoji}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{config.name}</h3>
                    <p className="text-sm text-gray-500">Currency: {config.currencySymbol} ({config.currency})</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Statutory Compliance:</h4>
                  <div className="flex flex-wrap gap-2">
                    {config.statutoryCompliance.slice(0, 4).map((compliance) => (
                      <span
                        key={compliance}
                        className={`
                          px-2 py-1 text-xs font-medium rounded-full
                          ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
                        `}
                      >
                        {compliance}
                      </span>
                    ))}
                    {config.statutoryCompliance.length > 4 && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                        +{config.statutoryCompliance.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Features list */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FeatureIcon enabled={config.features.hasProvidentFund} />
                      <span>Provident Fund</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FeatureIcon enabled={config.features.hasIncomeTax} />
                      <span>Income Tax</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FeatureIcon enabled={config.features.hasGratuity} />
                      <span>Gratuity</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FeatureIcon enabled={config.features.hasSocialSecurity} />
                      <span>Social Security</span>
                    </div>
                  </div>
                </div>

                {/* Existing badge for UAE */}
                {isUAE && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Currently Active</span>
                  </div>
                )}

                {/* New badge for India */}
                {config.code === 'INDIA' && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-orange-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>New Module</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Coming Soon Countries */}
        <div className="mb-10">
          <h3 className="text-sm font-medium text-gray-500 mb-4 text-center">Coming Soon</h3>
          <div className="flex justify-center gap-4 flex-wrap">
            {[
              { flag: '🇸🇦', name: 'Saudi Arabia' },
              { flag: '🇴🇲', name: 'Oman' },
              { flag: '🇶🇦', name: 'Qatar' },
              { flag: '🇰🇼', name: 'Kuwait' },
              { flag: '🇧🇭', name: 'Bahrain' },
            ].map((country) => (
              <div
                key={country.name}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-400"
              >
                <span className="text-2xl grayscale opacity-50">{country.flag}</span>
                <span className="text-sm">{country.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedCountry || isLoading}
            className={`
              px-8 py-3 rounded-xl font-semibold text-white
              transition-all duration-300 flex items-center gap-2
              ${selectedCountry && !isLoading
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Continue to Payroll</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Info Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          You can change your country selection anytime from the settings menu.
        </p>
      </div>
    </div>
  );
}

// Feature indicator component
function FeatureIcon({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );
}
