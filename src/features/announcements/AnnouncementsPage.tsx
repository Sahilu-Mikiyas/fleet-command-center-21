import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';

const items = [
  { id: 1, title: 'Welcome to FleetCommand', body: 'New marketplace experience launched. Post loads in seconds.', date: '2026-04-12' },
  { id: 2, title: 'Live tracking improvements', body: 'Real-time map updates are rolling out this week.', date: '2026-04-08' },
];

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" /> Announcements
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Updates, releases, and platform notices.</p>
      </motion.div>
      <div className="space-y-3">
        {items.map(a => (
          <Card key={a.id}>
            <CardContent className="p-5">
              <p className="font-semibold">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.date}</p>
              <p className="text-sm mt-2">{a.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
