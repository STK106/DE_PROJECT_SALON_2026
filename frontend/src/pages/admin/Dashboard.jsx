import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import StatsCard from '@/components/common/StatsCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Store, Calendar, Clock, CalendarCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboard();
        setStats(res.data.stats);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Monitor platform growth, demand, and approvals.</p>
            </div>
            <Badge variant="secondary">System health</Badge>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard title="Total Users" value={stats.total_users} icon={Users} description="Registered accounts" />
          <StatsCard title="Total Salons" value={stats.total_salons} icon={Store} description="Onboarded businesses" />
          <StatsCard title="Total Bookings" value={stats.total_bookings} icon={Calendar} description="All recorded orders" />
          <StatsCard title="Today's Bookings" value={stats.today_bookings} icon={CalendarCheck} description="Today's demand" />
          <StatsCard title="Pending Bookings" value={stats.pending_bookings} icon={Clock} description="Awaiting updates" />
          <StatsCard title="Pending Salons" value={stats.pending_salons} icon={AlertCircle} description="Awaiting approval" />
        </div>
      )}
    </div>
  );
}
