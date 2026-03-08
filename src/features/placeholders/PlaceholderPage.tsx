import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  widgets: { title: string; description: string }[];
}

export function PlaceholderPage({ title, description, icon: Icon, widgets }: PlaceholderPageProps) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card"
      >
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="relative z-10 flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground mb-2">{title}</h1>
            <p className="text-muted-foreground max-w-2xl">{description}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-warning/10 px-4 py-1.5 text-sm font-medium text-warning">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-warning" />
              </span>
              Backend Integration Pending
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preview Widgets */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {widgets.map((widget, i) => (
          <motion.div
            key={widget.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (i + 1) }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-card/60 p-6 shadow-card"
          >
            <div className="h-24 rounded-xl bg-muted/50 mb-4 flex items-center justify-center">
              <div className="h-4 w-3/4 rounded-full bg-muted animate-pulse" />
            </div>
            <h3 className="font-semibold font-display text-foreground mb-1">{widget.title}</h3>
            <p className="text-xs text-muted-foreground">{widget.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl bg-muted/50 border border-border p-6 text-center"
      >
        <p className="text-sm text-muted-foreground">
          This module is designed for upcoming implementation phases. The interface has been scaffolded to demonstrate the platform vision.
        </p>
      </motion.div>
    </div>
  );
}
