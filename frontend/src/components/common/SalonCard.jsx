import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Scissors } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resolveMediaUrl } from '@/lib/media';

export default function SalonCard({ salon }) {
  const navigate = useNavigate();
  const hasRatings = Number(salon.total_ratings || 0) > 0;
  const displayRating = hasRatings ? Number(salon.rating).toFixed(1) : '0.0';

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => navigate(`/salons/${salon.id}`)}>
      <div className="aspect-video relative bg-muted overflow-hidden">
        {salon.images && salon.images.length > 0 ? (
          <img
            src={resolveMediaUrl(salon.images[0])}
            alt={salon.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Scissors className="h-12 w-12 text-primary/40" />
          </div>
        )}
        <Badge className="absolute top-3 right-3 bg-white/90 text-foreground hover:bg-white">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
          {displayRating}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{salon.name}</h3>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span className="line-clamp-1">{salon.city}{salon.address ? `, ${salon.address}` : ''}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {salon.service_count || 0} services • {hasRatings ? `${salon.total_ratings} ratings` : 'No ratings yet'}
          </span>
          <Button size="sm" variant="secondary">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}
