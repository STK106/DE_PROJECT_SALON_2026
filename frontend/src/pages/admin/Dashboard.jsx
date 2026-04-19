import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import StatsCard from '@/components/common/StatsCard';
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
            <div key={i} className="h-32 rounded-lg border bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard title="Total Users" value={stats.total_users} icon={Users} />
          <StatsCard title="Total Salons" value={stats.total_salons} icon={Store} />
          <StatsCard title="Total Bookings" value={stats.total_bookings} icon={Calendar} />
          <StatsCard title="Today's Bookings" value={stats.today_bookings} icon={CalendarCheck} />
          <StatsCard title="Pending Bookings" value={stats.pending_bookings} icon={Clock} />
          <StatsCard title="Pending Salons" value={stats.pending_salons} icon={AlertCircle} description="Awaiting approval" />
        </div>
      )}
    </div>
  );
}
