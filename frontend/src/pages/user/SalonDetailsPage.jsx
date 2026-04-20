import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salonService, serviceService, staffService } from '@/services/salonService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Clock, Star, Phone, Mail, Scissors, Users, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { resolveMediaUrl } from '@/lib/media';
import toast from 'react-hot-toast';

export default function SalonDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [salonRes, servicesRes, staffRes] = await Promise.all([
          salonService.getById(id),
          serviceService.getBySalon(id),
          staffService.getBySalon(id),
        ]);
        if (mounted) {
          setSalon(salonRes.data.salon);
          setServices(servicesRes.data.services);
          setStaff(staffRes.data.staff);
          setCurrentImageIndex(0);
        }
      } catch (err) {
        if (mounted) {
          toast.error('Failed to load salon details');
          navigate('/');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [id, navigate]);

  // Auto-rotate images every 2 seconds
  useEffect(() => {
    if (!salon?.images || salon.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % salon.images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [salon?.images]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!salon) return null;

  // Group services by category
  const grouped = services.reduce((acc, svc) => {
    const cat = svc.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(svc);
    return acc;
  }, {});

  const submitRating = async () => {
    if (!ratingValue) {
      toast.error('Please select a rating first');
      return;
    }

    try {
      setRatingSubmitting(true);
      const res = await salonService.rateSalon(salon.id, ratingValue);
      setSalon((prev) => ({
        ...prev,
        rating: res.data.rating,
        total_ratings: res.data.total_ratings,
      }));
      toast.success(res.data.message || 'Rating submitted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit rating');
    } finally {
      setRatingSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{salon.name}</h1>
              <p className="text-sm text-muted-foreground">Explore services, team, and available details before booking.</p>
            </div>
            {salon.rating > 0 && (
              <Badge variant="secondary" className="text-sm">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 mr-1" />
                {Number(salon.rating).toFixed(1)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Salon Images with Carousel */}
      <div className="mb-8">
        {salon.images && salon.images.length > 0 ? (
          <div className="relative">
            <div className="rounded-lg overflow-hidden border bg-muted">
              <img 
                src={resolveMediaUrl(salon.images[currentImageIndex])} 
                alt={salon.name} 
                className="w-full h-80 object-cover"
              />
            </div>
            
            {salon.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? salon.images.length - 1 : prev - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentImageIndex(prev => prev === salon.images.length - 1 ? 0 : prev + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                
                <div className="flex justify-center gap-2 mt-3">
                  {salon.images.map((_, i) => (
                    <Button
                      key={i}
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentImageIndex(i)}
                      className={`h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-primary w-6' : 'bg-muted-foreground w-2'}`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="aspect-[2/1] bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
            <Scissors className="h-20 w-20 text-primary/30" />
          </div>
        )}
      </div>

      {/* Salon Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">About {salon.name}</h1>
              {salon.rating > 0 && (
                <Badge variant="secondary" className="text-sm">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 mr-1" />
                  {Number(salon.rating).toFixed(1)}
                </Badge>
              )}
            </div>
            {salon.description && (
              <p className="text-muted-foreground">{salon.description}</p>
            )}
          </div>

          <Separator />

          {/* Services */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Scissors className="h-5 w-5" /> Services
            </h2>
            {Object.keys(grouped).length === 0 ? (
              <p className="text-muted-foreground">No services available</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-3">{category}</h3>
                    <div className="space-y-2">
                      {items.map((svc) => (
                        <div key={svc.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div>
                            <p className="font-medium">{svc.name}</p>
                            {svc.description && <p className="text-sm text-muted-foreground">{svc.description}</p>}
                            <p className="text-xs text-muted-foreground">{svc.duration} min</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">₹{Number(svc.price).toFixed(0)}</span>
                            {user?.role === 'user' && (
                              <Button size="sm" onClick={() => navigate(`/book/${salon.id}?service=${svc.id}`)}>
                                Book
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Staff */}
          {staff.length > 0 && (
            <>
              <Separator />
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" /> Our Team
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {staff.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="p-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                          <span className="text-lg font-semibold text-primary">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                        {member.specialization && (
                          <p className="text-xs text-muted-foreground">{member.specialization}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Salon Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <span>{salon.address}, {salon.city}{salon.state ? `, ${salon.state}` : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{salon.opening_time?.slice(0, 5)} - {salon.closing_time?.slice(0, 5)}</span>
              </div>
              {salon.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{salon.phone}</span>
                </div>
              )}
              {salon.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{salon.email}</span>
                </div>
              )}
              {salon.working_days && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1">Working Days</p>
                  <div className="flex flex-wrap gap-1">
                    {salon.working_days.split(',').map(day => (
                      <Badge key={day} variant="secondary" className="text-xs">{day.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {user?.role === 'user' && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Rate this salon</p>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setRatingValue(value)}
                        className="p-1"
                        aria-label={`Rate ${value} star`}
                      >
                        <Star
                          className={`h-5 w-5 ${value <= ratingValue ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                        />
                      </Button>
                    ))}
                  </div>
                  <Button size="sm" onClick={submitRating} disabled={ratingSubmitting || ratingValue === 0}>
                    {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current rating: {Number(salon.rating || 0).toFixed(1)} ({salon.total_ratings || 0} ratings)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {user?.role === 'user' && services.length > 0 && (
            <Button className="w-full" size="lg" onClick={() => navigate(`/book/${salon.id}`)}>
              Book Appointment
            </Button>
          )}
          {!user && (
            <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
              Sign in to Book
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
