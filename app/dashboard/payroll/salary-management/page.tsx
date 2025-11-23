'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrencyFormatter } from '@/lib/hooks/use-currency-formatter';
import { useCountry } from '@/lib/context/CountryContext';
import {
  Plus,
  Trash2,
  Save,
  Download,
  Edit2,
  Globe,
  DollarSign,
  TrendingUp,
  Clock,
  Shield,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';

type CountryCode = 'INDIA' | 'UAE';
type PayElementType = 'permanent' | 'temporary';
type PayElementCategory = 'earning' | 'deduction';

interface PayElement {
  id: string;
  code: string;
  name: string;
  type: PayElementType;
  category: PayElementCategory;
  amount: number;
  isPercentage: boolean;
  isTaxable: boolean;
  isStatutory: boolean;
  country: CountryCode;
}

interface SalaryStructure {
  id: string;
  employeeId: string;
  employeeName: string;
  country: CountryCode;
  effectiveDate: string;
  payElements: PayElement[];
  ctc: number;
  gross: number;
  net: number;
}

export default function SalaryManagementPage() {
  const { country, setCountry } = useCountry();
  const formatCurrency = useCurrencyFormatter();
  const selectedCountry = (country || 'INDIA') as CountryCode;
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null);

  // Form state for new salary structure
  const [employeeName, setEmployeeName] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [payElements, setPayElements] = useState<PayElement[]>([]);

  useEffect(() => {
    // Load salary structures from localStorage
    const stored = localStorage.getItem('salary_structures');
    if (stored) {
      setSalaryStructures(JSON.parse(stored));
    }
  }, []);

  const saveSalaryStructures = (structures: SalaryStructure[]) => {
    localStorage.setItem('salary_structures', JSON.stringify(structures));
    setSalaryStructures(structures);
  };

  const predefinedElements: Record<CountryCode, Partial<PayElement>[]> = {
    INDIA: [
      { code: 'BASIC', name: 'Basic Salary', category: 'earning', isTaxable: true, isStatutory: false },
      { code: 'HRA', name: 'House Rent Allowance', category: 'earning', isTaxable: true, isStatutory: false },
      { code: 'LTA', name: 'Leave Travel Allowance', category: 'earning', isTaxable: false, isStatutory: false },
      { code: 'SPECIAL', name: 'Special Allowance', category: 'earning', isTaxable: true, isStatutory: false },
      { code: 'MEDICAL', name: 'Medical Allowance', category: 'earning', isTaxable: false, isStatutory: false },
      { code: 'CONVEYANCE', name: 'Conveyance Allowance', category: 'earning', isTaxable: false, isStatutory: false },
      { code: 'BONUS', name: 'Performance Bonus', category: 'earning', isTaxable: true, isStatutory: false },
      { code: 'PF', name: 'Provident Fund', category: 'deduction', isTaxable: false, isStatutory: true },
      { code: 'ESIC', name: 'Employee State Insurance', category: 'deduction', isTaxable: false, isStatutory: true },
      { code: 'PT', name: 'Professional Tax', category: 'deduction', isTaxable: false, isStatutory: true },
      { code: 'TDS', name: 'Tax Deducted at Source', category: 'deduction', isTaxable: false, isStatutory: true },
    ],
    UAE: [
      { code: 'BASIC', name: 'Basic Salary', category: 'earning', isTaxable: false, isStatutory: false },
      { code: 'HOUSING', name: 'Housing Allowance', category: 'earning', isTaxable: false, isStatutory: false },
      { code: 'TRANSPORT', name: 'Transport Allowance', category: 'earning', isTaxable: false, isStatutory: false },
      { code: 'FOOD', name: 'Food Allowance', category: 'earning', isTaxable: false, isStatutory: false },
      { code: 'EDUCATION', name: 'Education Allowance', category: 'earning', isTaxable: false, isStatutory: false },
      { code: 'MOBILE', name: 'Mobile Allowance', category: 'earning', isTaxable: false, isStatutory: false },
      { code: 'BONUS', name: 'Performance Bonus', category: 'earning', isTaxable: false, isStatutory: false },
      { code: 'GPSSA', name: 'GPSSA Contribution', category: 'deduction', isTaxable: false, isStatutory: true },
      { code: 'LOAN', name: 'Loan Deduction', category: 'deduction', isTaxable: false, isStatutory: false },
    ],
  };

  const addPayElement = (elementData: Partial<PayElement>, type: PayElementType) => {
    const newElement: PayElement = {
      id: `elem_${Date.now()}_${Math.random()}`,
      code: elementData.code || '',
      name: elementData.name || '',
      type,
      category: elementData.category || 'earning',
      amount: 0,
      isPercentage: false,
      isTaxable: elementData.isTaxable ?? true,
      isStatutory: elementData.isStatutory ?? false,
      country: selectedCountry,
    };
    setPayElements([...payElements, newElement]);
  };

  const updatePayElement = (id: string, field: keyof PayElement, value: any) => {
    setPayElements(payElements.map(elem =>
      elem.id === id ? { ...elem, [field]: value } : elem
    ));
  };

  const removePayElement = (id: string) => {
    setPayElements(payElements.filter(elem => elem.id !== id));
  };

  const calculateTotals = () => {
    const earnings = payElements
      .filter(e => e.category === 'earning')
      .reduce((sum, e) => sum + e.amount, 0);
    const deductions = payElements
      .filter(e => e.category === 'deduction')
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      gross: earnings,
      deductions,
      net: earnings - deductions,
      ctc: earnings,
    };
  };

  const saveSalaryStructure = () => {
    if (!employeeName) {
      alert('Please enter employee name');
      return;
    }

    if (payElements.length === 0) {
      alert('Please add at least one pay element');
      return;
    }

    const totals = calculateTotals();

    const newStructure: SalaryStructure = {
      id: editingStructure?.id || `sal_${Date.now()}`,
      employeeId: editingStructure?.employeeId || `emp_${Date.now()}`,
      employeeName,
      country: selectedCountry,
      effectiveDate,
      payElements,
      ctc: totals.ctc,
      gross: totals.gross,
      net: totals.net,
    };

    if (editingStructure) {
      // Update existing
      const updated = salaryStructures.map(s =>
        s.id === editingStructure.id ? newStructure : s
      );
      saveSalaryStructures(updated);
    } else {
      // Add new
      saveSalaryStructures([...salaryStructures, newStructure]);
    }

    resetForm();
  };

  const resetForm = () => {
    setEmployeeName('');
    setEffectiveDate(new Date().toISOString().split('T')[0]);
    setPayElements([]);
    setShowAddModal(false);
    setEditingStructure(null);
  };

  const editStructure = (structure: SalaryStructure) => {
    setEditingStructure(structure);
    setEmployeeName(structure.employeeName);
    setEffectiveDate(structure.effectiveDate);
    setPayElements(structure.payElements);
    setShowAddModal(true);
  };

  const deleteStructure = (id: string) => {
    if (confirm('Are you sure you want to delete this salary structure?')) {
      const filtered = salaryStructures.filter(s => s.id !== id);
      saveSalaryStructures(filtered);
    }
  };

  const exportToExcel = () => {
    const filtered = salaryStructures.filter(s => s.country === selectedCountry);

    if (filtered.length === 0) {
      alert('No salary structures to export');
      return;
    }

    // Prepare data for Excel
    const excelData = filtered.flatMap(structure => {
      const baseInfo = {
        'Employee Name': structure.employeeName,
        'Country': structure.country,
        'Effective Date': structure.effectiveDate,
      };

      return structure.payElements.map(elem => ({
        ...baseInfo,
        'Pay Element Code': elem.code,
        'Pay Element Name': elem.name,
        'Type': elem.type,
        'Category': elem.category,
        'Amount': elem.amount,
        'Is Percentage': elem.isPercentage ? 'Yes' : 'No',
        'Is Taxable': elem.isTaxable ? 'Yes' : 'No',
        'Is Statutory': elem.isStatutory ? 'Yes' : 'No',
      }));
    });

    // Create summary sheet
    const summaryData = filtered.map(structure => ({
      'Employee Name': structure.employeeName,
      'Country': structure.country,
      'Effective Date': structure.effectiveDate,
      'CTC': structure.ctc,
      'Gross Salary': structure.gross,
      'Net Salary': structure.net,
      'No. of Elements': structure.payElements.length,
      'Permanent Elements': structure.payElements.filter(e => e.type === 'permanent').length,
      'Temporary Elements': structure.payElements.filter(e => e.type === 'temporary').length,
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add summary sheet
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Add detailed sheet
    const wsDetails = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, wsDetails, 'Pay Elements');

    // Generate file name
    const fileName = `Salary_Structures_${selectedCountry}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  const totals = calculateTotals();

  const filteredStructures = salaryStructures.filter(s => s.country === selectedCountry);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Salary Management</h1>
          <p className="text-gray-600">Manage pay elements and salary structures by country</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={exportToExcel}
            disabled={filteredStructures.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Salary Structure
          </Button>
        </div>
      </div>

      {/* Country Selector */}
      <div className="mb-6">
        <div className="flex gap-3">
          <Button
            variant={selectedCountry === 'INDIA' ? 'default' : 'outline'}
            onClick={() => setCountry('INDIA')}
            className="flex items-center gap-2"
          >
            <span className="text-xl">🇮🇳</span>
            India
          </Button>
          <Button
            variant={selectedCountry === 'UAE' ? 'default' : 'outline'}
            onClick={() => setCountry('UAE')}
            className="flex items-center gap-2"
          >
            <span className="text-xl">🇦🇪</span>
            UAE
          </Button>
        </div>
      </div>

      {/* Salary Structures List */}
      <div className="grid gap-6">
        {filteredStructures.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No salary structures found for {selectedCountry}</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Structure
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredStructures.map((structure) => (
            <Card key={structure.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{structure.employeeName}</CardTitle>
                    <CardDescription>
                      Effective from: {new Date(structure.effectiveDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => editStructure(structure)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteStructure(structure.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium mb-1">Gross Salary</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(structure.gross)}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-600 font-medium mb-1">Deductions</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {formatCurrency(structure.gross - structure.net)}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium mb-1">Net Salary</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(structure.net)}
                    </p>
                  </div>
                </div>

                {/* Pay Elements */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Pay Elements</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Earnings */}
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Earnings
                      </p>
                      <div className="space-y-2">
                        {structure.payElements
                          .filter(e => e.category === 'earning')
                          .map(elem => (
                            <div key={elem.id} className="flex items-center justify-between bg-green-50 rounded px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">{elem.name}</span>
                                {elem.type === 'temporary' && (
                                  <span title="Temporary">
                                    <Clock className="h-3 w-3 text-orange-500" />
                                  </span>
                                )}
                                {elem.isStatutory && (
                                  <span title="Statutory">
                                    <Shield className="h-3 w-3 text-blue-500" />
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-semibold text-green-700">
                                {formatCurrency(elem.amount)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Deductions */}
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 rotate-180" />
                        Deductions
                      </p>
                      <div className="space-y-2">
                        {structure.payElements
                          .filter(e => e.category === 'deduction')
                          .map(elem => (
                            <div key={elem.id} className="flex items-center justify-between bg-red-50 rounded px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">{elem.name}</span>
                                {elem.type === 'temporary' && (
                                  <span title="Temporary">
                                    <Clock className="h-3 w-3 text-orange-500" />
                                  </span>
                                )}
                                {elem.isStatutory && (
                                  <span title="Statutory">
                                    <Shield className="h-3 w-3 text-blue-500" />
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-semibold text-red-700">
                                {formatCurrency(elem.amount)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {editingStructure ? 'Edit' : 'Add'} Salary Structure
                  </CardTitle>
                  <CardDescription>
                    Configure pay elements for {selectedCountry}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Employee Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Employee Name</Label>
                  <Input
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Enter employee name"
                  />
                </div>
                <div>
                  <Label>Effective Date</Label>
                  <Input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Add Pay Elements */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base">Pay Elements</Label>
                  <div className="flex gap-2">
                    <select
                      className="border rounded px-3 py-1 text-sm"
                      onChange={(e) => {
                        const selected = predefinedElements[selectedCountry].find(
                          el => el.code === e.target.value
                        );
                        if (selected) {
                          addPayElement(selected, 'permanent');
                        }
                        e.target.value = '';
                      }}
                    >
                      <option value="">+ Add Predefined</option>
                      {predefinedElements[selectedCountry].map((elem) => (
                        <option key={elem.code} value={elem.code}>
                          {elem.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pay Elements List */}
                <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                  {payElements.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No pay elements added. Select from predefined elements above.
                    </p>
                  ) : (
                    payElements.map((elem) => (
                      <div key={elem.id} className="bg-white rounded-lg p-4 border">
                        <div className="grid md:grid-cols-5 gap-3 mb-3">
                          <div className="md:col-span-2">
                            <Label className="text-xs">Element Name</Label>
                            <Input
                              value={elem.name}
                              onChange={(e) => updatePayElement(elem.id, 'name', e.target.value)}
                              placeholder="Element name"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Amount</Label>
                            <Input
                              type="number"
                              value={elem.amount}
                              onChange={(e) => updatePayElement(elem.id, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Type</Label>
                            <select
                              value={elem.type}
                              onChange={(e) => updatePayElement(elem.id, 'type', e.target.value as PayElementType)}
                              className="w-full border rounded px-2 py-2 text-sm"
                            >
                              <option value="permanent">Permanent</option>
                              <option value="temporary">Temporary</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removePayElement(elem.id)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={elem.isTaxable}
                              onChange={(e) => updatePayElement(elem.id, 'isTaxable', e.target.checked)}
                            />
                            Taxable
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={elem.isStatutory}
                              onChange={(e) => updatePayElement(elem.id, 'isStatutory', e.target.checked)}
                            />
                            Statutory
                          </label>
                          <span className={`px-2 py-0.5 rounded ${
                            elem.category === 'earning' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {elem.category}
                          </span>
                          {elem.type === 'temporary' && (
                            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Temporary
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Summary */}
              {payElements.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Gross Salary</p>
                      <p className="text-xl font-bold text-blue-700">{formatCurrency(totals.gross)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Deductions</p>
                      <p className="text-xl font-bold text-orange-700">{formatCurrency(totals.deductions)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Net Salary</p>
                      <p className="text-xl font-bold text-green-700">{formatCurrency(totals.net)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={saveSalaryStructure}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Structure
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
