import { useState, useEffect } from 'react';
import { salonService } from '@/services/salonService';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Store,
  Upload,
  CheckCircle,
  Clock,
  Trash2,
  MapPin,
  Phone,
  Mail,
  CalendarClock,
} from 'lucide-react';
import { resolveMediaUrl } from '@/lib/media';
import toast from 'react-hot-toast';

const DEFAULT_WORKING_DAYS = 'Mon,Tue,Wed,Thu,Fri,Sat';
const WEEK_DAYS = [
  { label: 'Mon', value: 'Mon' },
  { label: 'Tue', value: 'Tue' },
  { label: 'Wed', value: 'Wed' },
  { label: 'Thu', value: 'Thu' },
  { label: 'Fri', value: 'Fri' },
  { label: 'Sat', value: 'Sat' },
  { label: 'Sun', value: 'Sun' },
];

export default function ManageSalon() {
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    opening_time: '09:00',
    closing_time: '21:00',
    working_days: DEFAULT_WORKING_DAYS,
  });

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const res = await salonService.getMySalon();
        const currentSalon = res.data.salon;
        setSalon(currentSalon);
        setForm({
          name: currentSalon.name || '',
          description: currentSalon.description || '',
          address: currentSalon.address || '',
          city: currentSalon.city || '',
          state: currentSalon.state || '',
          phone: currentSalon.phone || '',
          email: currentSalon.email || '',
          opening_time: currentSalon.opening_time?.slice(0, 5) || '09:00',
          closing_time: currentSalon.closing_time?.slice(0, 5) || '21:00',
          working_days: currentSalon.working_days || DEFAULT_WORKING_DAYS,
        });
      } catch {
        setIsNew(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSalon();
  }, []);

  const selectedDays = new Set(
    form.working_days
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  );

  const handleDayToggle = (day, checked) => {
    const nextDays = new Set(selectedDays);

    if (checked) {
      nextDays.add(day);
    } else {
      nextDays.delete(day);
    }

    const orderedDays = WEEK_DAYS
      .map((item) => item.value)
      .filter((value) => nextDays.has(value));

    setForm({ ...form, working_days: orderedDays.join(',') });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.address || !form.city) {
      toast.error('Please fill required fields');
      return;
    }

    if (!form.working_days) {
      toast.error('Select at least one working day');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const res = await salonService.create(form);
        setSalon(res.data.salon);
        setIsNew(false);
        toast.success('Salon created! Awaiting admin approval.');
      } else {
        const res = await salonService.update(form);
        setSalon(res.data.salon);
        toast.success('Salon updated');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImageCount = salon?.images?.length || 0;
    if (currentImageCount + files.length > 5) {
      toast.error('You can upload up to 5 images only');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const res = await salonService.uploadImages(formData);
      setSalon(res.data.salon);
      toast.success('Images uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  const handleDeleteImage = async (index) => {
    try {
      const res = await salonService.deleteImage(index);
      setSalon(res.data.salon);
      toast.success('Image deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {isNew ? 'Create Salon' : 'Manage Salon'}
              </CardTitle>
              <CardDescription className="mt-1">
                Keep your profile complete and accurate to improve trust and booking conversion.
              </CardDescription>
            </div>
            {salon && (
              <Badge variant={salon.is_approved ? 'success' : 'warning'} className="px-3 py-1">
                {salon.is_approved ? (
                  <>
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    Approved
                  </>
                ) : (
                  <>
                    <Clock className="mr-1.5 h-3.5 w-3.5" />
                    Pending Approval
                  </>
                )}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">Profile details</Badge>
            <Badge variant="secondary">Location info</Badge>
            <Badge variant="secondary">Business hours</Badge>
            {!isNew && salon?.images?.length > 0 && (
              <Badge variant="outline">{salon.images.length}/5 images uploaded</Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="h-5 w-5" />
              Salon Details
            </CardTitle>
            <CardDescription>
              This information appears to customers while they browse and book your salon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Profile</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salon-name">Salon Name *</Label>
                  <Input
                    id="salon-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Sample Unisex Studio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salon-email" className="inline-flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </Label>
                  <Input
                    id="salon-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="sample.studio@salon.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salon-description">Description</Label>
                <Textarea
                  id="salon-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Tell customers what makes your salon special."
                  className="min-h-25"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Location & contact</h3>
              <div className="space-y-2">
                <Label htmlFor="salon-address" className="inline-flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Address *
                </Label>
                <Input
                  id="salon-address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="221B MG Road"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="salon-city">City *</Label>
                  <Input
                    id="salon-city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Bengaluru"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salon-state">State</Label>
                  <Input
                    id="salon-state"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="Karnataka"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salon-phone" className="inline-flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    Phone
                  </Label>
                  <Input
                    id="salon-phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91-9111111111"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Business hours</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="opening-time" className="inline-flex items-center gap-2">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Opening Time
                  </Label>
                  <Input
                    id="opening-time"
                    type="time"
                    value={form.opening_time}
                    onChange={(e) => setForm({ ...form, opening_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closing-time" className="inline-flex items-center gap-2">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Closing Time
                  </Label>
                  <Input
                    id="closing-time"
                    type="time"
                    value={form.closing_time}
                    onChange={(e) => setForm({ ...form, closing_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Working Days</Label>
                <div className="grid grid-cols-2 gap-3 rounded-md border p-4 sm:grid-cols-4">
                  {WEEK_DAYS.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={selectedDays.has(day.value)}
                        onCheckedChange={(checked) => handleDayToggle(day.value, checked === true)}
                      />
                      <Label htmlFor={`day-${day.value}`} className="cursor-pointer text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Choose days when customers can book services.</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-end border-t px-6 py-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : isNew ? 'Create Salon' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {!isNew && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5" />
              Salon Images
            </CardTitle>
            <CardDescription>
              Add high-quality photos to improve profile trust. Maximum 5 images.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {salon?.images && salon.images.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {salon.images.map((img, i) => (
                  <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border">
                    <img src={resolveMediaUrl(img)} alt="Salon" className="h-full w-full object-cover" />
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={() => handleDeleteImage(i)}
                      className="absolute right-2 top-2 h-8 w-8 bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                      aria-label="Delete image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-md border border-dashed p-4">
              <Label htmlFor="salon-images" className="mb-2 block">Upload new images</Label>
              <Input id="salon-images" type="file" accept="image/*" multiple onChange={handleImageUpload} />
              <p className="mt-2 text-xs text-muted-foreground">Supported formats: JPEG, PNG, WebP.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}