import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock3, CalendarDays, CircleDashed, Sparkles } from 'lucide-react';
import StatsCard from '@/components/common/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const statusVariant = {
  pending: 'warning',
  confirmed: 'default',
  completed: 'success',
  cancelled: 'destructive',
  rejected: 'destructive',
};

function formatCurrency(value) {
  const numericValue = Number(value || 0);
  return `₹${Number.isNaN(numericValue) ? '0' : numericValue.toFixed(0)}`;
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return '—';
  return value.slice(0, 5);
}

function FocusCard({ title, value, note, icon: Icon, accentClassName }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className={cn('rounded-lg p-2', accentClassName)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {note && <p className="mt-3 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export default function DashboardOverview({
  title,
  description,
  badgeLabel,
  actionLabel,
  actionTo,
  stats,
  focusCards = [],
  recentBookings = [],
  loading = false,
  emptyStateTitle,
  emptyStateDescription,
}) {
  return (
    <div className="space-y-6">
      <Card
        className="overflow-hidden border-primary/20 shadow-sm"
        style={{
          backgroundImage:
            'linear-gradient(90deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--background)) 55%, hsl(var(--background)) 100%)',
        }}
      >
        <CardContent className="relative flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {badgeLabel}
              </Badge>
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          {actionLabel && actionTo && (
            <Link className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')} to={actionTo}>
              {actionLabel}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((item) => (
            <StatsCard
              key={item.title}
              title={item.title}
              value={item.value}
              icon={item.icon}
              description={item.description}
            />
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CircleDashed className="h-4 w-4" />
              Operational snapshot
            </div>
            <CardTitle className="text-xl">Current focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : focusCards.length > 0 ? (
              <div className="grid gap-3">
                {focusCards.map((item) => (
                  <FocusCard
                    key={item.title}
                    title={item.title}
                    value={item.value}
                    note={item.note}
                    icon={item.icon}
                    accentClassName={item.accentClassName}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                No focus items available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Recent bookings
            </div>
            <CardTitle className="text-xl">Latest activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-6">
                {[...Array(4)].map((_, index) => (
                  <Skeleton key={index} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{emptyStateTitle}</p>
                <p className="mt-1">{emptyStateDescription}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        <div className="space-y-0.5">
                          <p>{booking.user_name}</p>
                          <p className="text-xs text-muted-foreground">{booking.salon_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.service_name}</TableCell>
                      <TableCell>{formatDate(booking.booking_date)}</TableCell>
                      <TableCell>{formatTime(booking.start_time)}</TableCell>
                      <TableCell>{formatCurrency(booking.service_price)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[booking.status] || 'secondary'}>{booking.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Clock3 className="h-3.5 w-3.5" />
        Updated in real time from live dashboard metrics.
      </div>
    </div>
  );
}