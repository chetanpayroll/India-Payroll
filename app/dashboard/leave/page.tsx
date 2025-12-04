"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function LeaveDashboard() {
  const { data: session } = useSession();
  const [balance, setBalance] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [balanceRes, leavesRes] = await Promise.all([
        fetch(`/api/leave/balance?employeeId=${session?.user?.id}`),
        fetch(`/api/leave?employeeId=${session?.user?.id}`)
      ]);

      if (balanceRes.ok) setBalance(await balanceRes.json());
      if (leavesRes.ok) setLeaves(await leavesRes.json());
    } catch (error) {
      console.error('Failed to fetch leave data', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200';
      case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
        <Link href="/dashboard/leave/apply">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Apply Leave
          </Button>
        </Link>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Leave</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance?.annualLeaveBalance || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available out of {balance?.annualLeaveEntitled || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sick Leave</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance?.sickLeaveBalance || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available out of {balance?.sickLeaveEntitled || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaves.filter(l => l.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved (YTD)</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaves.filter(l => l.status === 'APPROVED').length}
            </div>
            <p className="text-xs text-muted-foreground">Leaves taken this year</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leaves */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaves.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No leave history found.</p>
            ) : (
              leaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{leave.leaveType} Leave</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(leave.startDate), 'MMM dd, yyyy')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                      <span className="ml-2">({Number(leave.numberOfDays)} days)</span>
                    </p>
                    {leave.reason && (
                      <p className="text-sm text-gray-500 italic">"{leave.reason}"</p>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(leave.status)}`}>
                    {leave.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
