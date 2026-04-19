import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Store, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageSalons() {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSalons = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSalons({ page, limit: 20 });
      setSalons(res.data.salons);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load salons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSalons(); }, [page]);

  const handleApprove = async (id, approved) => {
    try {
      const res = await adminService.approveSalon(id, approved);
      toast.success(res.data.message);
      fetchSalons();
    } catch {
      toast.error('Action failed');
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Salons</h1>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : salons.length === 0 ? (
            <div className="p-8 text-center">
              <Store className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No salons registered</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salons.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{s.owner_name}</p>
                        <p className="text-xs text-muted-foreground">{s.owner_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{s.city}</TableCell>
                    <TableCell>
                      <Badge variant={s.is_approved ? 'success' : 'warning'}>
                        {s.is_approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {!s.is_approved ? (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => handleApprove(s.id, true)}>
                            <Check className="h-4 w-4 text-green-600 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleApprove(s.id, false)}>
                            <X className="h-4 w-4 text-destructive mr-1" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => handleApprove(s.id, false)}>
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
          <span className="text-sm text-muted-foreground px-4">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
}
