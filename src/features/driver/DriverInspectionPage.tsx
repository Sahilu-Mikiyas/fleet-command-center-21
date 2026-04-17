import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ClipboardCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const PRE_TRIP = [
  'Tires (pressure, tread, damage)',
  'Lights (head, tail, brake, indicators)',
  'Brakes responsive',
  'Oil and coolant levels',
  'Mirrors and windscreen clean',
  'Cargo properly secured',
  'Documents on board (license, insurance)',
];

const POST_TRIP = [
  'Vehicle parked safely',
  'Cargo delivered intact',
  'No new damage to vehicle',
  'Fuel level recorded',
  'Cabin and bed cleaned',
  'Documents returned',
];

function ChecklistForm({ items, kind }: { items: string[]; kind: 'pre' | 'post' }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const allChecked = items.every(i => checked[i]);

  const submit = () => {
    if (!allChecked) {
      toast.error('Please complete every check before submitting.');
      return;
    }
    toast.success(`${kind === 'pre' ? 'Pre-trip' : 'Post-trip'} inspection submitted.`);
    setChecked({});
    setNotes('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" /> {kind === 'pre' ? 'Pre-trip' : 'Post-trip'} checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(item => (
          <label key={item} className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/40">
            <Checkbox checked={!!checked[item]} onCheckedChange={(v) => setChecked(prev => ({ ...prev, [item]: !!v }))} />
            <span className="text-sm flex-1">{item}</span>
            {checked[item] && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          </label>
        ))}
        <div>
          <p className="text-xs uppercase text-muted-foreground mb-1">Notes / issues</p>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything to flag for dispatcher…" rows={3} />
        </div>
        <Button className="w-full" onClick={submit}>Submit inspection</Button>
      </CardContent>
    </Card>
  );
}

export default function DriverInspectionPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" /> Vehicle Inspection
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Complete pre-trip and post-trip checks for safety and compliance.</p>
      </motion.div>
      <Tabs defaultValue="pre">
        <TabsList>
          <TabsTrigger value="pre">Pre-trip</TabsTrigger>
          <TabsTrigger value="post">Post-trip</TabsTrigger>
        </TabsList>
        <TabsContent value="pre" className="mt-4"><ChecklistForm items={PRE_TRIP} kind="pre" /></TabsContent>
        <TabsContent value="post" className="mt-4"><ChecklistForm items={POST_TRIP} kind="post" /></TabsContent>
      </Tabs>
    </div>
  );
}
