import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resolveMediaUrl } from '@/lib/media';
import { clearCart, getCart, removeFromCart, updateCartQuantity } from '@/lib/cart';
import { productOrderService } from '@/services/salonService';
import toast from 'react-hot-toast';

const FALLBACK_PRODUCT_IMAGE = '/images/fallback-product.svg';

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ salonId: null, salonName: '', items: [] });
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    shipping_name: '',
    shipping_phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    notes: '',
  });

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = useMemo(
    () => cart.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    [cart.items]
  );

  const handleQuantity = (productId, quantity) => {
    const next = updateCartQuantity(productId, quantity);
    setCart(next);
  };

  const handleRemove = (productId) => {
    const next = removeFromCart(productId);
    setCart(next);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!cart.items.length) {
      toast.error('Your cart is empty.');
      return;
    }

    const requiredFields = [
      { key: 'shipping_name', label: 'Full name' },
      { key: 'shipping_phone', label: 'Phone' },
      { key: 'address_line1', label: 'Address line 1' },
      { key: 'city', label: 'City' },
      { key: 'postal_code', label: 'Postal code' },
    ];

    const missingField = requiredFields.find(({ key }) => !String(form[key] || '').trim());
    if (missingField) {
      toast.error(`${missingField.label} is required`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await productOrderService.createCheckout({
        ...form,
        items: cart.items.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
      });
      clearCart();
      toast.success('Order placed successfully');
      navigate(`/product-orders/${res.data.order.id}`);
    } catch (err) {
      const detail = err.response?.data?.details?.[0]?.message;
      toast.error(detail || err.response?.data?.error || err.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.items.length) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="mb-2 text-2xl font-bold">Your Cart Is Empty</h1>
            <p className="mb-4 text-muted-foreground">Add products from a salon to place an order.</p>
            <Button onClick={() => navigate('/')}>Browse Salons</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Cart Items</CardTitle>
            <p className="text-sm text-muted-foreground">Salon: {cart.salonName}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.product_id} className="flex items-center gap-4 rounded-lg border p-4">
                {item.image_urls?.[0] ? (
                  <img
                    src={resolveMediaUrl(item.image_urls[0])}
                    alt={item.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                    }}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                ) : (
                  <img src={FALLBACK_PRODUCT_IMAGE} alt="Product" className="h-16 w-16 rounded-md object-cover" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">₹{Number(item.price).toFixed(0)}</p>
                </div>
                <Input
                  type="number"
                  min="1"
                  className="w-20"
                  value={item.quantity}
                  onChange={(event) => handleQuantity(item.product_id, parseInt(event.target.value || '1', 10))}
                />
                <Button variant="ghost" onClick={() => handleRemove(item.product_id)}>Remove</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheckout} className="space-y-3">
              <Input required placeholder="Full name" value={form.shipping_name} onChange={(e) => setForm({ ...form, shipping_name: e.target.value })} />
              <Input required placeholder="Phone" value={form.shipping_phone} onChange={(e) => setForm({ ...form, shipping_phone: e.target.value })} />
              <Input required placeholder="Address line 1" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
              <Input placeholder="Address line 2" value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <Input required placeholder="Postal code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
              <Input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Total</span>
                  <span className="font-semibold">₹{total.toFixed(0)}</span>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Placing order...' : 'Place order'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
