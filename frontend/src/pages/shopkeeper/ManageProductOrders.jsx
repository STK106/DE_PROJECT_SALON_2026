import { useEffect, useState } from 'react';
import { productOrderService } from '@/services/salonService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import toast from 'react-hot-toast';
import { useShopkeeperSalons } from '@/hooks/useShopkeeperSalons';

const statusVariant = {
  pending_payment: 'warning',
  paid: 'default',
  processing: 'default',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'destructive',
  payment_failed: 'destructive',
};

export default function ManageProductOrders() {
  const { salons, selectedSalonId, setSelectedSalonId, loadingSalons } = useShopkeeperSalons();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!selectedSalonId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await productOrderService.getSalonOrders({ salon_id: selectedSalonId, status });
      setOrders(res.data.orders || []);
    } catch {
      toast.error('Failed to load product orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingSalons) fetchOrders();
  }, [selectedSalonId, status, loadingSalons]);

  const handleStatusUpdate = async (id, nextStatus) => {
    try {
      await productOrderService.updateStatus(id, nextStatus);
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-linear-to-r from-primary/10 via-background to-background">
        <CardContent className="p-5">
          <h1 className="text-2xl font-bold">Manage Product Orders</h1>
          <p className="text-sm text-muted-foreground">Track paid orders and move them through fulfilment.</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Select value={selectedSalonId || undefined} onValueChange={setSelectedSalonId} disabled={loadingSalons || salons.length === 0}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Select salon" /></SelectTrigger>
          <SelectContent>{salons.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No product orders found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.user_name}</p>
                        <p className="text-xs text-muted-foreground">{order.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>₹{Number(order.total_amount).toFixed(0)}</TableCell>
                    <TableCell>{order.payment_status}</TableCell>
                    <TableCell><Badge variant={statusVariant[order.order_status] || 'secondary'}>{order.order_status}</Badge></TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {['paid', 'processing', 'shipped'].includes(order.order_status) && (
                          <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate(order.id, order.order_status === 'paid' ? 'processing' : order.order_status === 'processing' ? 'shipped' : 'delivered')}>
                            {order.order_status === 'paid' ? 'Process' : order.order_status === 'processing' ? 'Ship' : 'Deliver'}
                          </Button>
                        )}
                        {order.order_status !== 'delivered' && order.order_status !== 'cancelled' && (
                          <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate(order.id, 'cancelled')}>Cancel</Button>
                        )}
                      </div>
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
