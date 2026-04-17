import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PlaceholderMapProps {
  title?: string;
  subtitle?: string;
  className?: string;
  markers?: Array<{ label: string; sub?: string }>;
}

/**
 * Visual placeholder for a real map. Will be wired to Mapbox/Leaflet later.
 * Renders a grid + animated dot to convey "live" status.
 */
export function PlaceholderMap({ title = 'Live map', subtitle, className, markers = [] }: PlaceholderMapProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/5 via-accent/30 to-primary/10">
        {/* grid */}
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* center pin */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-primary/40"
            />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
        </motion.div>
        <div className="absolute top-4 left-4 rounded-lg bg-background/80 backdrop-blur px-3 py-2 border border-border">
          <p className="text-xs font-semibold text-foreground">{title}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="absolute bottom-4 right-4 rounded-md bg-background/80 backdrop-blur px-2 py-1 border border-border">
          <p className="text-[10px] text-muted-foreground">Map provider integration coming soon</p>
        </div>
      </div>
      {markers.length > 0 && (
        <CardContent className="pt-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Tracked points</p>
          <div className="space-y-2">
            {markers.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-medium text-foreground">{m.label}</span>
                {m.sub && <span className="text-xs text-muted-foreground">— {m.sub}</span>}
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
