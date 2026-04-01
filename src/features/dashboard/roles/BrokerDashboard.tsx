import { motion } from 'framer-motion';
import {
  Network, TrendingUp, Users, DollarSign, Plus, BarChart3, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function BrokerDashboard() {
  const { user } = useAuth();

  // Mock data
  const brokerStats = {
    activeConnections: 24,
    totalCommission: 12500,
    successfulMatches: 156,
    pendingMatches: 8,
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-8"
      >
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-purple-500/5 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-display text-foreground mb-1">
            {greeting()}, {user?.fullName?.split(' ')[0] || 'Broker'} 👋
          </h1>
          <p className="text-muted-foreground">
            Manage your brokerage network • Connect shippers and operators
          </p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeUp}>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Connections</p>
                  <p className="text-3xl font-bold text-foreground">{brokerStats.activeConnections}</p>
                </div>
                <Network className="h-8 w-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Commission</p>
                  <p className="text-3xl font-bold text-green-600">${brokerStats.totalCommission}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Successful Matches</p>
                  <p className="text-3xl font-bold text-foreground">{brokerStats.successfulMatches}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Matches</p>
                  <p className="text-3xl font-bold text-orange-600">{brokerStats.pendingMatches}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions & Network Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold font-display mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'New Match', icon: Plus },
              { label: 'View Network', icon: Network },
              { label: 'Analytics', icon: BarChart3 },
              { label: 'Payments', icon: DollarSign },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto flex-col gap-2 py-4 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
              >
                <action.icon className="h-5 w-5 text-purple-500" />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Network Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold font-display mb-4">Network Status</h3>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Shippers</span>
                <span className="text-sm font-bold text-foreground">12</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-3/4 rounded-full bg-blue-500" />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Operators</span>
                <span className="text-sm font-bold text-foreground">12</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-3/4 rounded-full bg-orange-500" />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Drivers</span>
                <span className="text-sm font-bold text-foreground">45</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-full rounded-full bg-green-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold font-display mb-4">Recent Matches</h3>
          <div className="space-y-3">
            {[
              { shipper: 'ABC Corp', operator: 'Fleet Pro', status: 'Completed', commission: 450 },
              { shipper: 'XYZ Ltd', operator: 'Transport Co', status: 'Active', commission: 320 },
              { shipper: 'Tech Inc', operator: 'Logistics Plus', status: 'Pending', commission: 280 },
            ].map((match, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{match.shipper} → {match.operator}</p>
                    <p className="text-sm font-medium text-foreground">${match.commission}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    match.status === 'Completed' ? 'bg-green-500/20 text-green-600' :
                    match.status === 'Active' ? 'bg-blue-500/20 text-blue-600' :
                    'bg-yellow-500/20 text-yellow-600'
                  }`}>
                    {match.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Commission Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-display">Commission Breakdown</h3>
          <TrendingUp className="h-5 w-5 text-green-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">This Month</p>
            <p className="text-2xl font-bold text-foreground">$12,500</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Pending Payout</p>
            <p className="text-2xl font-bold text-orange-600">$2,100</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Avg. Per Match</p>
            <p className="text-2xl font-bold text-foreground">$80</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
            <p className="text-2xl font-bold text-green-500">95%</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
