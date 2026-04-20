import { useState, useEffect } from 'react';
import { salonService } from '@/services/salonService';
import SalonCard from '@/components/common/SalonCard';
import SearchBar from '@/components/common/SearchBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Scissors, Sparkles, Store, Clock3, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [quickFilter, setQuickFilter] = useState('all');

  const fetchSalons = async (searchQuery = '', pageNum = 1) => {
    setLoading(true);
    try {
      const res = await salonService.getAll({ search: searchQuery, page: pageNum, limit: 12 });
      setSalons(res.data.salons);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load salons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  const handleSearch = (query) => {
    setSearch(query);
    setPage(1);
    fetchSalons(query, 1);
  };

  const totalPages = Math.ceil(total / 12);
  const visibleSalons = salons.filter((salon) => {
    if (quickFilter === 'all') return true;
    const rating = Number(salon.rating || 0);
    if (quickFilter === 'top-rated') return rating >= 4;
    if (quickFilter === 'new') return Number(salon.total_ratings || 0) < 10;
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="starry-hero relative overflow-hidden py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 inline-flex gap-2 rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
            <Sparkles className="h-4 w-4" />
            Book your perfect salon experience
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Discover & Book<br />
            <span className="text-primary">Top Salons</span> Near You
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Browse salons, compare services, and book appointments in just a few clicks.
          </p>
          <div className="flex justify-center">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-lg bg-primary/10 p-2"><Store className="h-5 w-5 text-primary" /></div>
                <div className="text-left">
                  <p className="text-2xl font-bold">{total}</p>
                  <p className="text-xs text-muted-foreground">Active salons</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-lg bg-primary/10 p-2"><Clock3 className="h-5 w-5 text-primary" /></div>
                <div className="text-left">
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-xs text-muted-foreground">Instant booking flow</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-lg bg-primary/10 p-2"><Star className="h-5 w-5 text-primary" /></div>
                <div className="text-left">
                  <p className="text-2xl font-bold">4.8+</p>
                  <p className="text-xs text-muted-foreground">Top rated salons</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Salons Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Popular Salons</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {total} salon{total !== 1 ? 's' : ''} found
            </p>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex">Live availability</Badge>
        </div>

        <Tabs value={quickFilter} onValueChange={setQuickFilter} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All salons</TabsTrigger>
            <TabsTrigger value="top-rated">Top rated</TabsTrigger>
            <TabsTrigger value="new">Newly listed</TabsTrigger>
          </TabsList>
          <TabsContent value={quickFilter}>
            <Separator className="my-4" />
          </TabsContent>
        </Tabs>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : salons.length === 0 ? (
          <div className="text-center py-16">
            <Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No salons found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        ) : visibleSalons.length === 0 ? (
          <Card className="mx-auto max-w-lg text-center">
            <CardContent className="p-10">
              <h3 className="text-lg font-semibold mb-2">No results in this filter</h3>
              <p className="text-muted-foreground">Try switching tabs or removing your search text.</p>
              <Button className="mt-4" variant="outline" onClick={() => setQuickFilter('all')}>
                Show all salons
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleSalons.map((salon) => (
                <SalonCard key={salon.id} salon={salon} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPage(p => p - 1); fetchSalons(search, page - 1); }}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPage(p => p + 1); fetchSalons(search, page + 1); }}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
