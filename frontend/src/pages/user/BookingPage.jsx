import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { salonService, serviceService, staffService } from '@/services/salonService';
import { bookingService } from '@/services/bookingService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, CheckCircle, Clock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const { salonId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [nextAvailableSlots, setNextAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    service_id: searchParams.get('service') || '',
    staff_id: '',
    booking_date: '',
    start_time: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salonRes, servicesRes, staffRes] = await Promise.all([
          salonService.getById(salonId),
          serviceService.getBySalon(salonId),
          staffService.getBySalon(salonId),
        ]);

        setSalon(salonRes.data.salon);
        setServices(servicesRes.data.services || []);
        setStaffMembers(staffRes.data.staff || []);
      } catch (err) {
        toast.error('Failed to load booking details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [salonId, navigate]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!form.booking_date || !form.service_id) {
        setSlots([]);
        setNextAvailableSlots([]);
        return;
      }

      const selectedService = services.find((service) => String(service.id) === String(form.service_id));
      try {
        const response = await bookingService.getAvailableSlots(salonId, {
          date: form.booking_date,
          duration: selectedService?.duration || 30,
          staff_id: form.staff_id || null,
        });

        setSlots(response.data.slots || []);
        setNextAvailableSlots(response.data.next_available_slots || []);
        setForm((current) => ({ ...current, start_time: '' }));
      } catch {
        setSlots([]);
        setNextAvailableSlots([]);
      }
    };

    loadSlots();
  }, [form.booking_date, form.service_id, form.staff_id, services, salonId]);

  const today = new Date().toISOString().split('T')[0];
  const selectedService = services.find((service) => String(service.id) === String(form.service_id));
  const selectedStaff = staffMembers.find((staff) => String(staff.id) === String(form.staff_id));

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
        staff_id: form.staff_id || null,
        booking_date: form.booking_date,
        start_time: form.start_time,
        notes: form.notes,
      });

      setSuccess(true);
      toast.success('Booking confirmed');
    } catch (err) {
      const message = err.response?.data?.details?.[0]?.message || err.response?.data?.error || 'Booking failed';
      toast.error(message);

      if (err.response?.data?.next_available_slots) {
        setNextAvailableSlots(err.response.data.next_available_slots || []);
      }
      if (err.response?.data?.available_slots) {
        setSlots(err.response.data.available_slots || []);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Booking Confirmed</h2>
        <p className="mb-6 text-muted-foreground">
          Your appointment has been booked successfully. The salon will confirm it shortly.
        </p>
        <div className="space-y-2">
          <Button onClick={() => navigate('/my-bookings')} className="w-full">
            View My Bookings
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} className="w-full">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="mb-6 border-primary/20 bg-linear-to-r from-primary/10 via-background to-background">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h1 className="text-2xl font-bold">Book Appointment</h1>
              </div>
              <p className="text-muted-foreground">{salon?.name}</p>
            </div>
            <Badge variant="secondary">Secure booking</Badge>
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Choose a service, staff member, date, and time slot to confirm your appointment.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Service</CardTitle>
            <CardDescription>Pick the service you want to book.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={form.service_id || undefined} onValueChange={(value) => setForm({ ...form, service_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={String(service.id)}>
                    {service.name} - ₹{Number(service.price).toFixed(0)} ({service.duration} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedService && (
              <div className="mt-3 rounded-lg bg-accent/50 p-3 text-sm">
                <p className="font-medium">{selectedService.name}</p>
                <p className="text-muted-foreground">{selectedService.description}</p>
                <p className="mt-1">
                  Price: <span className="font-semibold">₹{Number(selectedService.price).toFixed(0)}</span> · Duration: {selectedService.duration} min
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Staff</CardTitle>
            <CardDescription>Choose the staff member you want to book with (optional).</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={form.staff_id || undefined} onValueChange={(value) => setForm({ ...form, staff_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={String(staff.id)}>
                    {staff.name}{staff.specialization ? ` - ${staff.specialization}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedStaff && (
              <div className="mt-3 rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-medium">{selectedStaff.name}</p>
                {selectedStaff.specialization && <p className="text-muted-foreground">{selectedStaff.specialization}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              min={today}
              value={form.booking_date}
              onChange={(e) => setForm({ ...form, booking_date: e.target.value, start_time: '' })}
            />
          </CardContent>
        </Card>

        {form.booking_date && form.service_id && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Select Time Slot
              </CardTitle>
              <CardDescription>
                Busy slots are disabled. Suggested next available times appear below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No slots available for this date.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => (
                    <Button
                      key={slot.start_time}
                      type="button"
                      variant={form.start_time === slot.start_time ? 'default' : slot.available ? 'outline' : 'secondary'}
                      size="sm"
                      disabled={!slot.available}
                      onClick={() => setForm({ ...form, start_time: slot.start_time })}
                    >
                      {slot.start_time}
                    </Button>
                  ))}
                </div>
              )}

              {nextAvailableSlots.length > 0 && (
                <div className="rounded-lg border border-dashed p-3">
                  <p className="mb-2 text-sm font-medium">Next available suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {nextAvailableSlots.map((slot) => (
                      <Button
                        key={`${slot.date}-${slot.start_time}`}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setForm({ ...form, booking_date: slot.date, start_time: slot.start_time })}
                      >
                        {slot.date} {slot.start_time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes</CardTitle>
            <CardDescription>Optional preferences or requests for the salon team.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any special requests or preferences..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </CardContent>
        </Card>

        {form.service_id && form.booking_date && form.start_time && (
          <Card className="border-primary/40">
            <CardContent className="p-4">
              <h3 className="mb-2 font-semibold">Booking Summary</h3>
              <div className="space-y-1 text-sm">
                <p>Service: <span className="font-medium">{selectedService?.name}</span></p>
                {selectedStaff && <p>Staff: <span className="font-medium">{selectedStaff?.name}</span></p>}
                <p>Date: <span className="font-medium">{new Date(form.booking_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                <p>Time: <span className="font-medium">{form.start_time}</span></p>
                <p>Price: <span className="font-medium">₹{Number(selectedService?.price || 0).toFixed(0)}</span></p>
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
