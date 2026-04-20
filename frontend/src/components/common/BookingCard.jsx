import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Star } from 'lucide-react';
import { salonService } from '@/services/salonService';
import toast from 'react-hot-toast';

const statusVariant = {
  pending: 'warning',
  confirmed: 'default',
  completed: 'success',
  cancelled: 'destructive',
  rejected: 'destructive',
};

export default function BookingCard({ booking, onCancel, onRated, showActions = true }) {
  const [showRating, setShowRating] = useState(false);
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(!!booking.user_rated);

  useEffect(() => {
    setAlreadyRated(!!booking.user_rated);
  }, [booking.user_rated]);

  const handleSubmitRating = async () => {
    if (!selected) return toast.error('Please select a star rating');
    setSubmitting(true);
    try {
      await salonService.rateSalon(booking.salon_id, booking.id, selected);
      toast.success('Thank you for your rating!');
      setAlreadyRated(true);
      setShowRating(false);
      setSelected(0);
      if (onRated) onRated(booking.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{booking.service_name}</h4>
              <Badge variant={statusVariant[booking.status] || 'secondary'}>
                {booking.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{booking.salon_name}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(booking.booking_date).toLocaleDateString()}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
              </span>
            </div>
            {booking.service_price && (
              <p className="text-sm font-medium">₹{Number(booking.service_price).toFixed(2)}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end">
            {showActions && booking.status === 'pending' && onCancel && (
              <Button variant="outline" size="sm" onClick={() => onCancel(booking.id)}>
                Cancel
              </Button>
            )}
            {showActions && booking.status === 'completed' && !alreadyRated && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-yellow-600 border-yellow-400 hover:bg-yellow-50"
                onClick={() => setShowRating((v) => !v)}
              >
                <Star className="h-4 w-4" />
                Rate Salon
              </Button>
            )}
            {booking.status === 'completed' && alreadyRated && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> Rated
              </span>
            )}
          </div>
        </div>

        {showRating && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Rate your experience at {booking.salon_name}</p>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  type="button"
                  variant="ghost"
                  size="icon"
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelected(star)}
                  className="p-0.5 focus:outline-none"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (hovered || selected)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </Button>
              ))}
              {selected > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">{selected} / 5</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled={submitting || !selected} onClick={handleSubmitRating}>
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowRating(false); setSelected(0); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
