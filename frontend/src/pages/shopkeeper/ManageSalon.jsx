import { useState, useEffect } from 'react';
import { salonService } from '@/services/salonService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, Upload, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/media';
import toast from 'react-hot-toast';

export default function ManageSalon() {
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', address: '', city: '', state: '',
    phone: '', email: '', opening_time: '09:00', closing_time: '21:00',
    working_days: 'Mon,Tue,Wed,Thu,Fri,Sat'
  });

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const res = await salonService.getMySalon();
        setSalon(res.data.salon);
        const s = res.data.salon;
        setForm({
          name: s.name || '', description: s.description || '',
          address: s.address || '', city: s.city || '', state: s.state || '',
          phone: s.phone || '', email: s.email || '',
          opening_time: s.opening_time?.slice(0, 5) || '09:00',
          closing_time: s.closing_time?.slice(0, 5) || '21:00',
          working_days: s.working_days || 'Mon,Tue,Wed,Thu,Fri,Sat'
        });
      } catch {
        setIsNew(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSalon();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.city) {
      toast.error('Please fill required fields');
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

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const res = await salonService.uploadImages(formData);
      setSalon(res.data.salon);
      toast.success('Images uploaded');
    } catch (err) {
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
    <div className="space-y-6 max-w-3xl">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{isNew ? 'Create Salon' : 'Manage Salon'}</h1>
              <p className="text-sm text-muted-foreground">Keep your profile fresh to improve booking conversion.</p>
            </div>
            {salon && (
              <Badge variant={salon.is_approved ? 'success' : 'warning'}>
                {salon.is_approved ? <><CheckCircle className="h-3 w-3 mr-1" /> Approved</> : <><Clock className="h-3 w-3 mr-1" /> Pending Approval</>}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Store className="h-5 w-5" /> Salon Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Profile essentials</Badge>
              <Badge variant="secondary">Business hours</Badge>
              <Badge variant="secondary">Contact details</Badge>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Salon Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My Salon" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell customers about your salon..." />
            </div>

            <div className="space-y-2">
              <Label>Address *</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Opening Time</Label>
                <Input type="time" value={form.opening_time} onChange={(e) => setForm({ ...form, opening_time: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Closing Time</Label>
                <Input type="time" value={form.closing_time} onChange={(e) => setForm({ ...form, closing_time: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Working Days</Label>
              <Input value={form.working_days} onChange={(e) => setForm({ ...form, working_days: e.target.value })} placeholder="Mon,Tue,Wed,Thu,Fri,Sat" />
              <p className="text-xs text-muted-foreground">Comma-separated days</p>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : isNew ? 'Create Salon' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Image Upload */}
      {!isNew && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Upload className="h-5 w-5" /> Images</CardTitle>
          </CardHeader>
          <CardContent>
            {salon?.images && salon.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {salon.images.map((img, i) => (
                  <div key={i} className="relative aspect-video rounded-lg overflow-hidden border group">
                    <img src={resolveMediaUrl(img)} alt="" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={() => handleDeleteImage(i)}
                      className="absolute top-2 right-2 h-8 w-8 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      aria-label="Delete image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Input type="file" accept="image/*" multiple onChange={handleImageUpload} />
            <p className="text-xs text-muted-foreground mt-1">Upload up to 5 images (JPEG, PNG, WebP)</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
