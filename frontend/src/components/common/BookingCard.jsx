import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';

const statusVariant = {
  pending: 'warning',
  confirmed: 'default',
  completed: 'success',
  cancelled: 'destructive',
  rejected: 'destructive',
};

export default function BookingCard({ booking, onCancel, showActions = true }) {
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
                {new Date(booking.booking_date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
              </span>
            </div>
            {booking.service_price && (
              <p className="text-sm font-medium">₹{Number(booking.service_price).toFixed(2)}</p>
            )}
          </div>
          {showActions && booking.status === 'pending' && onCancel && (
            <Button variant="outline" size="sm" onClick={() => onCancel(booking.id)}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
