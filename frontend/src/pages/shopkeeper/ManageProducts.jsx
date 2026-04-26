import { useEffect, useState } from 'react';
import { productService } from '@/services/salonService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Package, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useShopkeeperSalons } from '@/hooks/useShopkeeperSalons';
import { resolveMediaUrl } from '@/lib/media';

const FALLBACK_PRODUCT_IMAGE = '/images/fallback-product.svg';

const emptyForm = { name: '', description: '', price: '', stock: '0', category: '' };

function getProductImages(product) {
  if (Array.isArray(product?.image_urls) && product.image_urls.length > 0) {
    return product.image_urls;
  }
  return product?.image_url ? [product.image_url] : [];
}

export default function ManageProducts() {
  const { salons, selectedSalonId, setSelectedSalonId, loadingSalons } = useShopkeeperSalons();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    if (!selectedSalonId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      const res = await productService.getMyProducts(selectedSalonId);
      setProducts(res.data.products || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingSalons) {
      fetchProducts();
    }
  }, [selectedSalonId, loadingSalons]);

  const handleOpen = (product = null) => {
    if (product) {
      setEditing(product.id);
      setForm({
        name: product.name,
        description: product.description || '',
        price: String(product.price),
        stock: String(product.stock ?? 0),
        category: product.category || '',
      });
      setImagePreviews(getProductImages(product));
    } else {
      setEditing(null);
      setForm(emptyForm);
      setImagePreviews([]);
    }
    setSelectedImages([]);
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
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('description', form.description || '');
      payload.append('price', String(parseFloat(form.price)));
      payload.append('stock', String(parseInt(form.stock || '0', 10)));
      payload.append('category', form.category || '');

      for (const image of selectedImages) {
        payload.append('images', image);
      }

      if (editing) {
        await productService.update(editing, payload);
        toast.success('Product updated');
      } else {
        await productService.create(payload, selectedSalonId);
        toast.success('Product added');
      }

      setDialogOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productService.delete(id);
      toast.success('Product removed');
      fetchProducts();
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
              <CardTitle className="text-2xl font-semibold tracking-tight">Manage Products</CardTitle>
              <CardDescription className="mt-1">
                Add your salon retail products so users can browse and rate them.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpen()} disabled={!selectedSalonId}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
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
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product List</CardTitle>
          <CardDescription>Update product info, stock, and availability.</CardDescription>
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
              <p className="text-muted-foreground">Create a salon first to manage products.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-10 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No products yet. Add your first product.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getProductImages(product)[0] ? (
                          <img
                            src={resolveMediaUrl(getProductImages(product)[0])}
                            alt={product.name}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                            }}
                            className="h-12 w-12 rounded-md border object-cover"
                          />
                        ) : (
                          <img src={FALLBACK_PRODUCT_IMAGE} alt="Product" className="h-12 w-12 rounded-md border object-cover" />
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="max-w-64 truncate text-xs text-muted-foreground">{product.description || '-'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category || '-'}</TableCell>
                    <TableCell>₹{Number(product.price).toFixed(0)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        {Number(product.rating || 0).toFixed(1)} ({product.total_ratings || 0})
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'success' : 'secondary'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleOpen(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
            <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name *</Label>
              <Input
                id="product-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Hair Serum"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="product-price">Price *</Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-stock">Stock</Label>
                <Input
                  id="product-stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <Input
                id="product-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Hair Care"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea
                id="product-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="min-h-20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-image">Product Images</Label>
              <Input
                id="product-image"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setSelectedImages(files);
                  setImagePreviews(files.map((file) => URL.createObjectURL(file)));
                }}
              />
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map((preview, index) => (
                    <img
                      key={`${preview}-${index}`}
                      src={resolveMediaUrl(preview)}
                      alt={`Product preview ${index + 1}`}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                      }}
                      className="h-24 w-24 rounded-md border object-cover"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
