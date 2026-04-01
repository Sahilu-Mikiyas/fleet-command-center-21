import { motion } from 'framer-motion';
import {
  Users, TrendingUp, AlertTriangle, CheckCircle2, BarChart3, Settings, Shield, Activity,
} from 'lucide-react';
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

export default function AdminDashboard() {
  const { user } = useAuth();

  // Mock data
  const adminStats = {
    totalUsers: 1250,
    pendingApprovals: 23,
    activeOperators: 156,
    totalRevenue: 125000,
    systemHealth: 99.8,
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
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-red-500/5 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-display text-foreground mb-1">
            {greeting()}, {user?.fullName?.split(' ')[0] || 'Admin'} 👋
          </h1>
          <p className="text-muted-foreground">
            System administration panel • Manage users, approvals, and platform settings
          </p>
        </div>
      </motion.div>

      {/* Critical Metrics */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div variants={fadeUp}>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">{adminStats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="border-border border-orange-500/50 bg-orange-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Approvals</p>
                  <p className="text-3xl font-bold text-orange-600">{adminStats.pendingApprovals}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Operators</p>
                  <p className="text-3xl font-bold text-green-600">{adminStats.activeOperators}</p>
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
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-foreground">${(adminStats.totalRevenue / 1000).toFixed(0)}K</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">System Health</p>
                  <p className="text-3xl font-bold text-green-600">{adminStats.systemHealth}%</p>
                </div>
                <Activity className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Admin Controls & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold font-display mb-4">Admin Controls</h3>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Review Approvals
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Security & Logs
            </Button>
          </div>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold font-display mb-4">Pending Approvals ({adminStats.pendingApprovals})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {[
              { name: 'John Operator', role: 'OPERATOR', company: 'Fleet Pro', date: '2 hours ago' },
              { name: 'Sarah Transport', role: 'OPERATOR', company: 'Logistics Plus', date: '5 hours ago' },
              { name: 'Mike Broker', role: 'BROKER', company: 'Trade Connect', date: '1 day ago' },
              { name: 'Emma Driver', role: 'DRIVER', company: 'Fleet Pro', date: '2 days ago' },
            ].map((approval, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground">{approval.name}</p>
                    <p className="text-xs text-muted-foreground">{approval.role} • {approval.company}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{approval.date}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold font-display mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium text-foreground">API Server</span>
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-semibold text-green-600">Operational</span>
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium text-foreground">Database</span>
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-semibold text-green-600">Operational</span>
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium text-foreground">Payment Gateway</span>
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-semibold text-green-600">Operational</span>
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium text-foreground">Email Service</span>
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-xs font-semibold text-yellow-600">Degraded</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold font-display mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'User registered', user: 'john@example.com', time: '5 min ago' },
              { action: 'Operator approved', user: 'Sarah Transport', time: '1 hour ago' },
              { action: 'Payment processed', user: 'Fleet Pro', time: '3 hours ago' },
              { action: 'System backup completed', user: 'System', time: '6 hours ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Activity className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
