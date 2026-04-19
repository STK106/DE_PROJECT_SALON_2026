import { useState, useEffect } from 'react';
import { salonService } from '@/services/salonService';
import SalonCard from '@/components/common/SalonCard';
import SearchBar from '@/components/common/SearchBar';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Scissors, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            Book your perfect salon experience
          </div>
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
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card animate-pulse">
                <div className="aspect-video bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
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
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {salons.map((salon) => (
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
