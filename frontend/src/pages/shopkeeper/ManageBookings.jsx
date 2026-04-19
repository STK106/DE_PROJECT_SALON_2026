import { useState, useEffect } from 'react';
import { bookingService } from '@/services/bookingService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Calendar, Check, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const statusVariant = {
  pending: 'warning',
  confirmed: 'default',
  completed: 'success',
  cancelled: 'destructive',
  rejected: 'destructive',
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (status) params.status = status;
      if (date) params.date = date;
      const res = await bookingService.getSalonBookings(params);
      setBookings(res.data.bookings);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [status, date, page]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await bookingService.updateStatus(id, newStatus);
      toast.success(`Booking ${newStatus}`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Bookings</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </Select>
        <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }} className="w-44" />
        {(status || date) && (
          <Button variant="ghost" onClick={() => { setStatus(''); setDate(''); setPage(1); }}>Clear</Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No bookings found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{b.user_name}</p>
                        <p className="text-xs text-muted-foreground">{b.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{b.service_name}</TableCell>
                    <TableCell>{new Date(b.booking_date).toLocaleDateString()}</TableCell>
                    <TableCell>{b.start_time?.slice(0, 5)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {b.status === 'pending' && (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate(b.id, 'confirmed')}>
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate(b.id, 'rejected')}>
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                      {b.status === 'confirmed' && (
                        <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate(b.id, 'completed')}>
                          <CheckCircle className="h-4 w-4 text-green-600 mr-1" /> Complete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
          <span className="text-sm text-muted-foreground px-4">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
}
