"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function ApplyLeavePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        leaveType: 'ANNUAL',
        startDate: '',
        endDate: '',
        reason: '',
        halfDay: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/leave/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: session?.user?.id,
                    ...formData
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit leave application');
            }

            toast({
                title: "Success",
                description: "Leave application submitted successfully",
            });

            router.push('/dashboard/leave');
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Apply for Leave</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Leave Type</Label>
                            <Select
                                value={formData.leaveType}
                                onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select leave type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                                    <SelectItem value="SICK">Sick Leave</SelectItem>
                                    <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                                    <SelectItem value="EMERGENCY">Emergency Leave</SelectItem>
                                    <SelectItem value="MATERNITY">Maternity Leave</SelectItem>
                                    <SelectItem value="PATERNITY">Paternity Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="halfDay"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={formData.halfDay}
                                onChange={(e) => setFormData({ ...formData, halfDay: e.target.checked })}
                            />
                            <Label htmlFor="halfDay">Half Day</Label>
                        </div>

                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Textarea
                                required
                                placeholder="Please provide a reason for your leave..."
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                rows={4}
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" type="button" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Application
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
