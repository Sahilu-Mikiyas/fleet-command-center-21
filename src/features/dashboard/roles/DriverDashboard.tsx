import { motion } from 'framer-motion';
import {
  MapPin, Clock, DollarSign, Star, Navigation, AlertCircle, Phone, LogOut,
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

export default function DriverDashboard() {
  const { user, logout } = useAuth();

  // Mock data
  const currentTrip = {
    id: 'TRIP-001',
    pickup: 'Warehouse A',
    destination: 'Downtown Center',
    distance: 24.5,
    eta: '2:30 PM',
    earnings: 45.50,
  };

  const todayStats = {
    tripsCompleted: 3,
    totalEarnings: 156.75,
    rating: 4.9,
    hoursWorked: 8.5,
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
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-green-500/5 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-display text-foreground mb-1">
            {greeting()}, {user?.fullName?.split(' ')[0] || 'Driver'} 👋
          </h1>
          <p className="text-muted-foreground">
            Welcome to your driver portal • Track trips and earnings
          </p>
        </div>
      </motion.div>

      {/* Current Trip */}
      {currentTrip && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-gradient-to-br from-green-500/10 to-transparent p-6 shadow-card"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold font-display mb-1">Current Trip</h3>
              <p className="text-sm text-muted-foreground">Trip ID: {currentTrip.id}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-600 text-xs font-semibold">
              In Progress
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Pickup Location</p>
                  <p className="font-semibold text-foreground">{currentTrip.pickup}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Navigation className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="font-semibold text-foreground">{currentTrip.destination}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Arrival</p>
                  <p className="font-semibold text-foreground">{currentTrip.eta}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Trip Earnings</p>
                  <p className="font-semibold text-foreground">${currentTrip.earnings}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              <Navigation className="h-4 w-4 mr-2" />
              Start Navigation
            </Button>
            <Button variant="outline" className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </motion.div>
      )}

      {/* Today's Stats */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeUp}>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Trips Completed</p>
                  <p className="text-3xl font-bold text-foreground">{todayStats.tripsCompleted}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-green-600">${todayStats.totalEarnings}</p>
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
                  <p className="text-sm text-muted-foreground mb-1">Your Rating</p>
                  <p className="text-3xl font-bold text-foreground">{todayStats.rating}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Hours Worked</p>
                  <p className="text-3xl font-bold text-foreground">{todayStats.hoursWorked}h</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <h3 className="text-lg font-semibold font-display mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto flex-col gap-2 py-4">
            <MapPin className="h-5 w-5 text-blue-500" />
            <span className="text-xs font-medium">View Map</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4">
            <Clock className="h-5 w-5 text-orange-500" />
            <span className="text-xs font-medium">Trip History</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4">
            <DollarSign className="h-5 w-5 text-green-500" />
            <span className="text-xs font-medium">Earnings</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-xs font-medium">Report Issue</span>
          </Button>
        </div>
      </motion.div>

      {/* Alerts & Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <h3 className="text-lg font-semibold font-display mb-4">Notifications</h3>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">New trip available</p>
              <p className="text-xs text-muted-foreground">Downtown to Airport - $52</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Bonus available</p>
              <p className="text-xs text-muted-foreground">Complete 5 trips today for 20% bonus</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
