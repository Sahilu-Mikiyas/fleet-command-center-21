import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, DollarSign, Truck, Route, CheckCircle2 } from 'lucide-react';

const stats = [
  { label: 'Total Earnings', value: 'ETB 124,500', icon: DollarSign, change: '+12% MoM' },
  { label: 'Completed Trips', value: '48', icon: CheckCircle2, change: '+6 this week' },
  { label: 'Active Vehicles', value: '5', icon: Truck, change: 'Stable' },
  { label: 'Miles Covered', value: '8,420 km', icon: Route, change: '+340 km' },
];

export default function VendorStatsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> Performance Stats
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Earnings, trips, and fleet utilization overview.</p>
      </motion.div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <s.icon className="h-5 w-5 text-primary" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.change}</span>
                </div>
                <p className="text-2xl font-bold mt-2">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Trend overview</CardTitle></CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center bg-gradient-to-r from-primary/5 to-accent/30 rounded-lg border border-dashed border-border">
            <p className="text-sm text-muted-foreground">Chart visualization (recharts) — wire to /analytics endpoint</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
