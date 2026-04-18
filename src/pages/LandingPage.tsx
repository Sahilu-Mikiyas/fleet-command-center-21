import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, CreditCard, Shield, Truck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const highlights = [
  { icon: Truck, title: 'Smart Fleet Visibility', body: 'Monitor shipments, vehicles, and delivery milestones in one unified control center.' },
  { icon: Zap, title: 'Fast Dispatch Workflows', body: 'Create orders, match transporters, and streamline execution with role-based operations.' },
  { icon: Shield, title: 'Secure Operational Control', body: 'Protected role permissions keep each workflow safe, clear, and auditable.' },
];

const sections = [
  'Real-time logistics orchestration',
  'Integrated marketplace and contracts',
  'Role-based dashboards for every user type',
  'Payment and transaction tracking',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(120deg, hsl(20 20% 10% / 0.75), hsl(20 20% 10% / 0.45)), url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1800&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute -top-24 -right-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-12 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-32">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <p className="inline-flex items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1 text-xs uppercase tracking-wider text-primary-foreground">
              FleetCommand Platform
            </p>
            <h1 className="mt-5 text-4xl font-bold font-display text-primary-foreground md:text-6xl">
              Move Freight Faster with Beautiful, Intelligent Fleet Operations
            </h1>
            <p className="mt-5 text-base text-primary-foreground/90 md:text-lg">
              A complete logistics workspace for shippers, transporters, brokers, and fleet operators — from order creation to live tracking and payment.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-12 px-6 gradient-primary text-primary-foreground">
                <Link to="/login">
                  Login to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" className="h-12 px-6 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25">
                <Link to="/pay-order">
                  <CreditCard className="mr-2 h-4 w-4" /> Pay for an Order
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid gap-5 md:grid-cols-3"
        >
          {highlights.map((h, i) => (
            <motion.div key={h.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Card className="h-full border-border bg-card shadow-card">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <h.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold font-display">{h.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{h.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Visual split section */}
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-6 pb-16 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-bold font-display">Everything You Need on One Logistics Homepage</h2>
          <p className="mt-3 text-muted-foreground">
            Designed for fast operations: instant context, role-driven workflows, clean transitions, and direct access to key actions.
          </p>
          <div className="mt-6 space-y-3">
            {sections.map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
          <div
            className="h-80 rounded-2xl border border-border shadow-card"
            style={{
              backgroundImage:
                "linear-gradient(140deg, hsl(20 20% 10% / 0.35), hsl(20 20% 10% / 0.15)), url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1400&q=80')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute -bottom-4 -left-4 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-card">
            <p className="text-xs text-muted-foreground">24/7 orchestration</p>
            <p className="text-lg font-bold font-display">Enterprise-grade fleet flow</p>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-10 md:flex-row md:items-center">
          <div>
            <h3 className="text-2xl font-bold font-display">Ready to move?</h3>
            <p className="text-sm text-muted-foreground">Sign in to manage operations or make a direct payment by order ID.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="gradient-primary text-primary-foreground">
              <Link to="/login">Go to Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/pay-order">Pay an Order</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
