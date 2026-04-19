import { useState, useEffect } from 'react';
import { salonService } from '@/services/salonService';
import StatsCard from '@/components/common/StatsCard';
import { Calendar, CalendarCheck, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShopkeeperDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await salonService.getStats();
        setStats(res.data.stats);
      } catch {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg border bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Bookings"
            value={stats.total_bookings}
            icon={Calendar}
          />
          <StatsCard
            title="Today's Bookings"
            value={stats.today_bookings}
            icon={CalendarCheck}
          />
          <StatsCard
            title="Pending"
            value={stats.pending_bookings}
            icon={Clock}
          />
          <StatsCard
            title="Completed"
            value={stats.completed_bookings}
            icon={CheckCircle}
          />
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">No salon found</h3>
          <p className="text-muted-foreground">Create your salon profile to get started.</p>
        </div>
      )}
    </div>
  );
}
