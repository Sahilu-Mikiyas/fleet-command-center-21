import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function DriverProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
  });

  const rating = 4.7;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-primary" /> My Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Keep your contact and identity information up to date.</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Identity</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-3">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.photo} />
              <AvatarFallback className="text-2xl">{user?.fullName?.[0] || 'D'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
              ))}
              <span className="text-xs ml-2">{rating.toFixed(1)} / 5</span>
            </div>
            <Button variant="outline" size="sm">Change photo</Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Contact details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Full name</Label><Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><Label>Phone number</Label><Input value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <Button onClick={() => toast.success('Profile updated')}>Save changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
