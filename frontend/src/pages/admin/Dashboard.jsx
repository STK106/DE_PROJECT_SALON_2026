import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { Users, Store, Calendar, Clock, CalendarCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardOverview from '@/components/common/DashboardOverview';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashboardResponse, bookingsResponse] = await Promise.all([
          adminService.getDashboard(),
          adminService.getBookings({ limit: 5 }),
        ]);
        setStats(dashboardResponse.data.stats);
        setRecentBookings(bookingsResponse.data.bookings);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const dashboardStats = stats
    ? [
        { title: 'Total Users', value: stats.total_users, icon: Users, description: 'Registered accounts' },
        { title: 'Total Salons', value: stats.total_salons, icon: Store, description: 'Onboarded businesses' },
        { title: 'Total Bookings', value: stats.total_bookings, icon: Calendar, description: 'All recorded orders' },
        { title: "Today's Bookings", value: stats.today_bookings, icon: CalendarCheck, description: 'Today\'s demand' },
        { title: 'Pending Bookings', value: stats.pending_bookings, icon: Clock, description: 'Awaiting updates' },
        { title: 'Pending Salons', value: stats.pending_salons, icon: AlertCircle, description: 'Awaiting approval' },
      ]
    : [];

  const focusCards = stats
    ? [
        {
          title: 'Pending bookings',
          value: stats.pending_bookings,
          note: 'Items waiting for review across the platform.',
          icon: Clock,
          accentClassName: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        },
        {
          title: 'Salon approvals',
          value: stats.pending_salons,
          note: 'New salons that still need an admin decision.',
          icon: Store,
          accentClassName: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
        },
        {
          title: "Today's activity",
          value: stats.today_bookings,
          note: 'Bookings received so far today.',
          icon: CalendarCheck,
          accentClassName: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
        },
      ]
    : [];

  return (
    <DashboardOverview
      title="Admin Dashboard"
      description="Monitor platform growth, demand, and approvals from a single command center."
      badgeLabel="System health"
      actionLabel="View bookings"
      actionTo="/admin/bookings"
      stats={dashboardStats}
      focusCards={focusCards}
      recentBookings={recentBookings}
      loading={loading}
      emptyStateTitle="No booking activity yet"
      emptyStateDescription="Bookings will appear here once customers start scheduling sessions."
    />
  );
}
