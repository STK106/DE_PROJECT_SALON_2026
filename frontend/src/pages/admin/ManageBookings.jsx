import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const statusVariant = {
  pending: 'warning',
  confirmed: 'default',
  completed: 'success',
  cancelled: 'destructive',
  rejected: 'destructive',
};

export default function AdminManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (status) params.status = status;
      if (date) params.date = date;
      const res = await adminService.getBookings(params);
      setBookings(res.data.bookings);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [status, date, page]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background">
        <CardContent className="p-5">
          <h1 className="text-2xl font-bold">All Bookings</h1>
          <p className="text-sm text-muted-foreground">Audit platform-wide activity and booking trends.</p>
        </CardContent>
      </Card>

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

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No bookings found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Salon</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.user_name}</TableCell>
                    <TableCell>{b.salon_name}</TableCell>
                    <TableCell>{b.service_name}</TableCell>
                    <TableCell>{new Date(b.booking_date).toLocaleDateString()}</TableCell>
                    <TableCell>₹{Number(b.service_price).toFixed(0)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
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
