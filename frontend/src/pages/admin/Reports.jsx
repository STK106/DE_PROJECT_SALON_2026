import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, bookRes] = await Promise.all([
          adminService.getDashboard(),
          adminService.getBookings({ limit: 10 }),
        ]);
        setStats(dashRes.data.stats);
        setRecentBookings(bookRes.data.bookings);
      } catch {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Skeleton className="h-64 rounded-lg border" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-linear-to-r from-primary/10 via-background to-background">
        <CardContent className="p-5">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" /> Reports Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Snapshot of key platform metrics and recent transactions.</p>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total_users}</p>
              <p className="text-sm text-muted-foreground">Total Customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total_salons}</p>
              <p className="text-sm text-muted-foreground">Registered Salons</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total_bookings}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.today_bookings}</p>
              <p className="text-sm text-muted-foreground">Today's Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.pending_bookings}</p>
              <p className="text-sm text-muted-foreground">Pending Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.pending_salons}</p>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Bookings Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentBookings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No booking data available</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Salon</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.user_name}</TableCell>
                    <TableCell>{b.salon_name}</TableCell>
                    <TableCell>{b.service_name}</TableCell>
                    <TableCell>{new Date(b.booking_date).toLocaleDateString()}</TableCell>
                    <TableCell>₹{Number(b.service_price).toFixed(0)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        b.status === 'completed' ? 'success' :
                        b.status === 'pending' ? 'warning' :
                        b.status === 'cancelled' || b.status === 'rejected' ? 'destructive' : 'default'
                      }>
                        {b.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
