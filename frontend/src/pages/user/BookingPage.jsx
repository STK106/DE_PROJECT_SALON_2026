import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { salonService, serviceService } from '@/services/salonService';
import { bookingService } from '@/services/bookingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const { salonId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    service_id: searchParams.get('service') || '',
    booking_date: '',
    start_time: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salonRes, servicesRes] = await Promise.all([
          salonService.getById(salonId),
          serviceService.getBySalon(salonId),
        ]);
        setSalon(salonRes.data.salon);
        setServices(servicesRes.data.services);
      } catch {
        toast.error('Failed to load salon info');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [salonId, navigate]);

  useEffect(() => {
    if (form.booking_date && form.service_id) {
      const service = services.find(s => s.id === form.service_id);
      const fetchSlots = async () => {
        try {
          const res = await bookingService.getAvailableSlots(salonId, {
            date: form.booking_date,
            duration: service?.duration || 30,
          });
          setSlots(res.data.slots);
          setForm(f => ({ ...f, start_time: '' }));
        } catch {
          setSlots([]);
        }
      };
      fetchSlots();
    }
  }, [form.booking_date, form.service_id, salonId, services]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.service_id || !form.booking_date || !form.start_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await bookingService.create({
        salon_id: salonId,
        service_id: form.service_id,
        booking_date: form.booking_date,
        start_time: form.start_time,
        notes: form.notes,
      });
      setSuccess(true);
      toast.success('Booking confirmed!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground mb-6">
          Your appointment has been booked successfully. The salon will confirm your booking shortly.
        </p>
        <div className="space-y-2">
          <Button onClick={() => navigate('/my-bookings')} className="w-full">View My Bookings</Button>
          <Button variant="outline" onClick={() => navigate('/')} className="w-full">Back to Home</Button>
        </div>
      </div>
    );
  }

  const selectedService = services.find(s => s.id === form.service_id);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold mb-1">Book Appointment</h1>
              <p className="text-muted-foreground">{salon?.name}</p>
            </div>
            <Badge variant="secondary">Secure booking</Badge>
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">Choose service, date, and slot to confirm your appointment.</p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Service</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={form.service_id}
              onChange={(e) => setForm({ ...form, service_id: e.target.value })}
            >
              <option value="">Choose a service...</option>
              {services.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name} - ₹{Number(svc.price).toFixed(0)} ({svc.duration} min)
                </option>
              ))}
            </Select>
            {selectedService && (
              <div className="mt-3 p-3 bg-accent/50 rounded-lg text-sm">
                <p className="font-medium">{selectedService.name}</p>
                <p className="text-muted-foreground">{selectedService.description}</p>
                <p className="mt-1">Price: <span className="font-semibold">₹{Number(selectedService.price).toFixed(0)}</span> · Duration: {selectedService.duration} min</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              min={today}
              value={form.booking_date}
              onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
            />
          </CardContent>
        </Card>

        {/* Time Slot Selection */}
        {form.booking_date && form.service_id && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" /> Select Time Slot
              </CardTitle>
            </CardHeader>
            <CardContent>
              {slots.length === 0 ? (
                <p className="text-muted-foreground text-sm">No slots available for this date</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <Button
                      key={slot.start_time}
                      type="button"
                      variant={form.start_time === slot.start_time ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setForm({ ...form, start_time: slot.start_time })}
                    >
                      {slot.start_time}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any special requests or preferences..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </CardContent>
        </Card>

        {/* Summary & Submit */}
        {form.service_id && form.booking_date && form.start_time && (
          <Card className="border-primary/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Booking Summary</h3>
              <div className="text-sm space-y-1">
                <p>Service: <span className="font-medium">{selectedService?.name}</span></p>
                <p>Date: <span className="font-medium">{new Date(form.booking_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                <p>Time: <span className="font-medium">{form.start_time}</span></p>
                <p>Price: <span className="font-medium">₹{Number(selectedService?.price).toFixed(0)}</span></p>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={submitting || !form.service_id || !form.booking_date || !form.start_time}
        >
          {submitting ? 'Confirming...' : 'Confirm Booking'}
        </Button>
      </form>
    </div>
  );
}
