import { useState, useEffect } from 'react';
import { salonService } from '@/services/salonService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, CalendarOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Availability() {
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    blocked_date: '', start_time: '', end_time: '', reason: '', is_full_day: false
  });

  const fetchBlocked = async () => {
    try {
      const res = await salonService.getBlockedSlots();
      setBlockedSlots(res.data.blocked_slots);
    } catch {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlocked(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.blocked_date) { toast.error('Date is required'); return; }

    try {
      await salonService.addBlockedSlot({
        ...form,
        start_time: form.is_full_day ? null : form.start_time,
        end_time: form.is_full_day ? null : form.end_time,
      });
      toast.success('Slot blocked');
      setForm({ blocked_date: '', start_time: '', end_time: '', reason: '', is_full_day: false });
      fetchBlocked();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to block slot');
    }
  };

  const handleRemove = async (id) => {
    try {
      await salonService.removeBlockedSlot(id);
      toast.success('Blocked slot removed');
      fetchBlocked();
    } catch {
      toast.error('Failed to remove');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background">
        <CardContent className="p-5">
          <h1 className="text-2xl font-bold">Availability Management</h1>
          <p className="text-sm text-muted-foreground">Block dates and times to avoid scheduling conflicts.</p>
        </CardContent>
      </Card>

      {/* Block Slot Form */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarOff className="h-5 w-5" /> Block Time Slot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" min={today} value={form.blocked_date} onChange={(e) => setForm({ ...form, blocked_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Holiday, maintenance..." />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Checkbox
                id="full-day"
                checked={form.is_full_day}
                onCheckedChange={(checked) => setForm({ ...form, is_full_day: Boolean(checked) })}
              />
              <Label htmlFor="full-day" className="cursor-pointer font-normal">Block full day</Label>
            </div>

            {!form.is_full_day && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                </div>
              </div>
            )}

            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" /> Block Slot
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Blocked Slots List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Blocked Slots</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : blockedSlots.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No blocked slots</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockedSlots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell>{new Date(slot.blocked_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {slot.is_full_day ? (
                        <Badge variant="secondary">Full Day</Badge>
                      ) : (
                        `${slot.start_time?.slice(0, 5)} - ${slot.end_time?.slice(0, 5)}`
                      )}
                    </TableCell>
                    <TableCell>{slot.reason || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleRemove(slot.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
