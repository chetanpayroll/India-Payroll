"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Check, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ApprovalsPage() {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user?.id) {
            fetchLeaves();
        }
    }, [session]);

    const fetchLeaves = async () => {
        try {
            // Fetch all pending leaves (API should filter by manager's team ideally)
            // For now, fetching all pending leaves if user is manager/admin
            const res = await fetch(`/api/leave?status=PENDING`);
            const data = await res.json();
            if (res.ok) setLeaves(data);
        } catch (error) {
            console.error('Failed to fetch approvals', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setProcessing(id);
        try {
            const endpoint = action === 'approve'
                ? `/api/leave/${id}/approve`
                : `/api/leave/${id}/reject`;

            const body = action === 'reject' ? { reason: 'Rejected by manager' } : {}; // Simple reject for now

            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || `Failed to ${action}`);
            }

            toast({
                title: "Success",
                description: `Leave request ${action}d successfully`,
            });

            // Remove from list
            setLeaves(leaves.filter(l => l.id !== id));

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6 p-8">
            <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>

            <Tabs defaultValue="leave">
                <TabsList>
                    <TabsTrigger value="leave">Leave Requests ({leaves.length})</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance (0)</TabsTrigger>
                    <TabsTrigger value="overtime">Overtime (0)</TabsTrigger>
                </TabsList>

                <TabsContent value="leave" className="space-y-4">
                    {leaves.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                No pending leave requests.
                            </CardContent>
                        </Card>
                    ) : (
                        leaves.map((leave) => (
                            <Card key={leave.id}>
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-semibold text-lg">
                                                {leave.employee.firstName} {leave.employee.lastName}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                ({leave.employee.department})
                                            </span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium">{leave.leaveType} Leave</span>
                                            <span className="mx-2">•</span>
                                            <span>{Number(leave.numberOfDays)} days</span>
                                            <span className="mx-2">•</span>
                                            <span>
                                                {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                                            </span>
                                        </div>
                                        {leave.reason && (
                                            <p className="text-sm text-gray-600 italic mt-2">"{leave.reason}"</p>
                                        )}
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleAction(leave.id, 'reject')}
                                            disabled={!!processing}
                                        >
                                            {processing === leave.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                                            Reject
                                        </Button>
                                        <Button
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => handleAction(leave.id, 'approve')}
                                            disabled={!!processing}
                                        >
                                            {processing === leave.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                            Approve
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="attendance">
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            No pending attendance regularizations.
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
