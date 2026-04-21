import { useState, useEffect } from 'react';
import { serviceService } from '@/services/salonService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Pencil, Trash2, Scissors, MoreHorizontal, Clock3, CircleDollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { useShopkeeperSalons } from '@/hooks/useShopkeeperSalons';

const emptyForm = { name: '', description: '', price: '', duration: '30', category: '' };

export default function ManageServices() {
  const { salons, selectedSalonId, setSelectedSalonId, loadingSalons } = useShopkeeperSalons();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    if (!selectedSalonId) {
      setServices([]);
      setLoading(false);
      return;
    }

    try {
      const res = await serviceService.getMyServices(selectedSalonId);
      setServices(res.data.services);
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingSalons) {
      fetchServices();
    }
  }, [selectedSalonId, loadingSalons]);

  const handleOpen = (service = null) => {
    if (service) {
      setEditing(service.id);
      setForm({
        name: service.name, description: service.description || '',
        price: String(service.price), duration: String(service.duration),
        category: service.category || ''
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error('Name and price are required');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await serviceService.update(editing, { ...form, price: parseFloat(form.price), duration: parseInt(form.duration) });
        toast.success('Service updated');
      } else {
        await serviceService.create({ ...form, price: parseFloat(form.price), duration: parseInt(form.duration) }, selectedSalonId);
        toast.success('Service added');
      }
      setDialogOpen(false);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await serviceService.delete(id);
      toast.success('Service removed');
      fetchServices();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl font-semibold tracking-tight">Manage Services</CardTitle>
              <CardDescription className="mt-1">
                Keep your service catalog clear so customers can compare duration and pricing quickly.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpen()} disabled={!selectedSalonId}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>

          <div className="max-w-xs">
            <Label className="mb-2 block">Salon</Label>
            <Select value={selectedSalonId || undefined} onValueChange={setSelectedSalonId} disabled={loadingSalons || salons.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Select salon" />
              </SelectTrigger>
              <SelectContent>
                {salons.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">Catalog management</Badge>
            <Badge variant="secondary">Pricing control</Badge>
            <Badge variant="secondary">Duration planning</Badge>
            {!loading && <Badge variant="outline">{services.length} total services</Badge>}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service List</CardTitle>
          <CardDescription>Edit, activate, or remove services from your booking catalog.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-3">
                  <Skeleton className="h-8 col-span-2" />
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                </div>
              ))}
            </div>
          ) : !selectedSalonId ? (
            <div className="p-10 text-center">
              <p className="text-muted-foreground">Create a salon first to manage services.</p>
            </div>
          ) : services.length === 0 ? (
            <div className="p-10 text-center">
              <Scissors className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No services yet. Add your first service.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((svc) => (
                  <TableRow key={svc.id}>
                    <TableCell className="font-medium">{svc.name}</TableCell>
                    <TableCell className="max-w-70 truncate text-muted-foreground">
                      {svc.description || '-'}
                    </TableCell>
                    <TableCell>{svc.category || '-'}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <CircleDollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        ₹{Number(svc.price).toFixed(0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />
                        {svc.duration} min
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={svc.is_active ? 'success' : 'secondary'}>
                        {svc.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpen(svc)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(svc.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-4 space-y-5">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Service profile</h3>
              <div className="space-y-2">
                <Label htmlFor="service-name">Service Name *</Label>
                <Input
                  id="service-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Classic Haircut"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-description">Description</Label>
                <Textarea
                  id="service-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Explain what is included in this service."
                  className="min-h-24"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Pricing & timing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-price">Price (Rs.) *</Label>
                  <Input
                    id="service-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-duration">Duration (min)</Label>
                  <Input
                    id="service-duration"
                    type="number"
                    min="5"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-category">Category</Label>
              <Input
                id="service-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Haircut, Facial, Spa"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
