import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productOrderService } from '@/services/salonService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { resolveMediaUrl } from '@/lib/media';
import toast from 'react-hot-toast';

export default function ProductOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await productOrderService.getById(id);
        setOrder(res.data.order);
      } catch {
        toast.error('Failed to load order');
        navigate('/my-product-orders');
      }
    };

    fetchOrder();
  }, [id, navigate]);

  if (!order) return null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="font-medium">Salon:</span> {order.salon_name}</p>
          <p><span className="font-medium">Status:</span> {order.order_status}</p>
          <p><span className="font-medium">Payment:</span> {order.payment_status}</p>
          <p><span className="font-medium">Total:</span> ₹{Number(order.total_amount).toFixed(0)}</p>
          <p><span className="font-medium">Ship To:</span> {order.shipping_name}, {order.shipping_phone}</p>
          <p><span className="font-medium">Address:</span> {order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ''}, {order.city}, {order.state || ''} {order.postal_code}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-lg border p-4">
              {item.image_urls?.[0] ? <img src={resolveMediaUrl(item.image_urls[0])} alt={item.product_name} className="h-16 w-16 rounded-md object-cover" /> : <div className="h-16 w-16 rounded-md border bg-muted" />}
              <div className="flex-1">
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <p className="font-semibold">₹{Number(item.line_total).toFixed(0)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
