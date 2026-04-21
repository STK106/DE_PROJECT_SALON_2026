import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productOrderService } from '@/services/salonService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

const statusVariant = {
  pending_payment: 'warning',
  paid: 'default',
  processing: 'default',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'destructive',
  payment_failed: 'destructive',
};

export default function MyProductOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await productOrderService.getMyOrders();
        setOrders(res.data.orders || []);
      } catch {
        toast.error('Failed to load product orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-4">
      <Card className="border-primary/20 bg-linear-to-r from-primary/10 via-background to-background">
        <CardContent className="p-5">
          <h1 className="text-2xl font-bold">My Product Orders</h1>
          <p className="text-sm text-muted-foreground">Track your salon product purchases.</p>
        </CardContent>
      </Card>

      {loading ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent></Card>
      ) : orders.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No product orders yet.</CardContent></Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{order.salon_name}</p>
                <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">₹{Number(order.total_amount).toFixed(0)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusVariant[order.order_status] || 'secondary'}>{order.order_status}</Badge>
                <Button variant="outline" onClick={() => navigate(`/product-orders/${order.id}`)}>View</Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
