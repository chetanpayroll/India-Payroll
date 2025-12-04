"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, MapPin, Clock, LogIn, LogOut } from 'lucide-react';
import { format } from 'date-fns';

export default function AttendanceDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch today's attendance
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/attendance?employeeId=${session?.user?.id}&from=${todayStr}&to=${todayStr}`);
      const data = await res.json();
      if (data.length > 0) setTodayAttendance(data[0]);

      // Fetch history (last 5 days)
      const historyRes = await fetch(`/api/attendance?employeeId=${session?.user?.id}`); // Default fetches all, limit in UI for now
      const historyData = await historyRes.json();
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch attendance', error);
    }
  };

  const handlePunch = async (type: 'in' | 'out') => {
    setLoading(true);
    try {
      // Get location
      let location = undefined;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          location = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
        } catch (e) {
          console.warn('Location access denied');
        }
      }

      const endpoint = type === 'in' ? '/api/attendance/punch-in' : '/api/attendance/punch-out';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: session?.user?.id,
          location
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to punch ${type}`);
      }

      toast({
        title: "Success",
        description: data.message,
      });

      fetchData(); // Refresh data
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
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Punch Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Daily Attendance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6 py-4">
            <div className="text-4xl font-mono font-bold text-primary">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            <div className="text-muted-foreground">
              {format(currentTime, 'EEEE, MMMM do, yyyy')}
            </div>

            <div className="flex space-x-4 w-full justify-center">
              {!todayAttendance?.checkInTime ? (
                <Button
                  size="lg"
                  className="w-40 bg-green-600 hover:bg-green-700"
                  onClick={() => handlePunch('in')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  Punch In
                </Button>
              ) : !todayAttendance?.checkOutTime ? (
                <Button
                  size="lg"
                  className="w-40 bg-red-600 hover:bg-red-700"
                  onClick={() => handlePunch('out')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                  Punch Out
                </Button>
              ) : (
                <div className="text-center p-4 bg-gray-100 rounded-lg w-full">
                  <p className="font-medium text-green-700">Attendance Completed</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(todayAttendance.checkInTime), 'HH:mm')} - {format(new Date(todayAttendance.checkOutTime), 'HH:mm')}
                  </p>
                </div>
              )}
            </div>

            {todayAttendance && (
              <div className="w-full space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Check In:</span>
                  <span className="font-medium">
                    {todayAttendance.checkInTime ? format(new Date(todayAttendance.checkInTime), 'hh:mm a') : '--:--'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Check Out:</span>
                  <span className="font-medium">
                    {todayAttendance.checkOutTime ? format(new Date(todayAttendance.checkOutTime), 'hh:mm a') : '--:--'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium px-2 py-0.5 rounded text-xs ${todayAttendance.status === 'LATE' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {todayAttendance.status}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent History */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{format(new Date(record.date), 'MMM dd, yyyy')}</p>
                    <div className="flex items-center text-xs text-muted-foreground space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        {record.checkInTime ? format(new Date(record.checkInTime), 'HH:mm') : '--'} -
                        {record.checkOutTime ? format(new Date(record.checkOutTime), 'HH:mm') : '--'}
                      </span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${record.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                      record.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                    }`}>
                    {record.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
