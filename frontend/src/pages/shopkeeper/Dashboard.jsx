import { useState, useEffect } from 'react';
import { salonService } from '@/services/salonService';
import { Calendar, CalendarCheck, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardOverview from '@/components/common/DashboardOverview';
import { bookingService } from '@/services/bookingService';
import { useShopkeeperSalons } from '@/hooks/useShopkeeperSalons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ShopkeeperDashboard() {
  const { salons, selectedSalonId, setSelectedSalonId, loadingSalons } = useShopkeeperSalons();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedSalonId) {
        setStats(null);
        setRecentBookings([]);
        setLoading(false);
        return;
      }

      try {
        const [statsResponse, bookingsResponse] = await Promise.all([
          salonService.getStats(selectedSalonId),
          bookingService.getSalonBookings({ limit: 5, salon_id: selectedSalonId }),
        ]);
        setStats(statsResponse.data.stats);
        setRecentBookings(bookingsResponse.data.bookings);
      } catch {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedSalonId]);

  const dashboardStats = stats
    ? [
        { title: 'Total Bookings', value: stats.total_bookings, icon: Calendar, description: 'All-time requests' },
        { title: "Today's Bookings", value: stats.today_bookings, icon: CalendarCheck, description: 'Scheduled today' },
        { title: 'Pending', value: stats.pending_bookings, icon: Clock, description: 'Need action' },
        { title: 'Completed', value: stats.completed_bookings, icon: CheckCircle, description: 'Finished visits' },
      ]
    : [];

  const focusCards = stats
    ? [
        {
          title: 'Pending bookings',
          value: stats.pending_bookings,
          note: 'Requests still waiting for your response.',
          icon: Clock,
          accentClassName: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        },
        {
          title: 'Completed bookings',
          value: stats.completed_bookings,
          note: 'Jobs marked complete for this salon.',
          icon: CheckCircle,
          accentClassName: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
        },
        {
          title: "Today's bookings",
          value: stats.today_bookings,
          note: 'Sessions scheduled for today.',
          icon: CalendarCheck,
          accentClassName: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
        },
      ]
    : [];

  if (!loading && !stats && salons.length === 0) {
    return (
      <div className="rounded-lg border bg-card py-16 text-center">
        <h3 className="mb-2 text-lg font-semibold">No salon found</h3>
        <p className="text-muted-foreground">Create your salon profile to get started.</p>
      </div>
    );
  }

  const selector = (
    <div className="mb-4 max-w-xs">
      <Select value={selectedSalonId || undefined} onValueChange={setSelectedSalonId} disabled={loadingSalons || salons.length === 0}>
        <SelectTrigger>
          <SelectValue placeholder="Select salon" />
        </SelectTrigger>
        <SelectContent>
          {salons.map((item) => (
            <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div>
      {selector}
      <DashboardOverview
        title="Shopkeeper Dashboard"
        description="Track bookings, keep the queue moving, and stay on top of today’s salon flow."
        badgeLabel="Live overview"
        actionLabel="Open bookings"
        actionTo="/shopkeeper/bookings"
        stats={dashboardStats}
        focusCards={focusCards}
        recentBookings={recentBookings}
        loading={loading}
        emptyStateTitle="No bookings waiting"
        emptyStateDescription="Your latest bookings will appear here once customers start scheduling appointments."
      />
    </div>
  );
}
