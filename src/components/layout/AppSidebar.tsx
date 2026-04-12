import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Truck,
  Users,
  Settings,
  Package,
  FileText,
  MapPin,
  CreditCard,
  BarChart3,
  Shield,
  ChevronRight,
  ShoppingCart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

type SidebarItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

const navConfig: Record<UserRole, { primary: SidebarItem[]; secondary: SidebarItem[] }> = {
  SHIPPER: {
    primary: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'My Orders', url: '/orders', icon: Package },
      { title: 'Marketplace', url: '/marketplace', icon: ShoppingCart },
      { title: 'Payments', url: '/payments', icon: CreditCard },
    ],
    secondary: [
      { title: 'Analytics', url: '/analytics', icon: BarChart3 },
    ],
  },
  VENDOR: {
    primary: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Orders', url: '/orders', icon: Package },
      { title: 'Contracts', url: '/contracts', icon: FileText },
    ],
    secondary: [
      { title: 'Payments', url: '/payments', icon: CreditCard },
    ],
  },
  DRIVER: {
    primary: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Marketplace', url: '/marketplace', icon: ShoppingCart },
      { title: 'Tracking', url: '/tracking', icon: MapPin },
      { title: 'Payments', url: '/payments', icon: CreditCard },
    ],
    secondary: [],
  },
  COMPANY_ADMIN: {
    primary: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Company', url: '/company', icon: Building2 },
      { title: 'Vehicles', url: '/vehicles', icon: Truck },
      { title: 'Drivers', url: '/drivers', icon: Users },
      { title: 'Contracts', url: '/contracts', icon: FileText },
    ],
    secondary: [
      { title: 'Orders', url: '/orders', icon: Package },
      { title: 'Marketplace', url: '/marketplace', icon: ShoppingCart },
      { title: 'Broker Ops', url: '/broker', icon: Shield },
      { title: 'Analytics', url: '/analytics', icon: BarChart3 },
      { title: 'Payments', url: '/payments', icon: CreditCard },
    ],
  },
  PRIVATE_TRANSPORTER: {
    primary: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Marketplace', url: '/marketplace', icon: ShoppingCart },
      { title: 'Drivers', url: '/drivers', icon: Users },
      { title: 'Tracking', url: '/tracking', icon: MapPin },
    ],
    secondary: [
      { title: 'Orders', url: '/orders', icon: Package },
      { title: 'Payments', url: '/payments', icon: CreditCard },
    ],
  },
  BROKER: {
    primary: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Broker Console', url: '/broker', icon: Shield },
      { title: 'Marketplace', url: '/marketplace', icon: ShoppingCart },
    ],
    secondary: [
      { title: 'Tracking', url: '/tracking', icon: MapPin },
      { title: 'Analytics', url: '/analytics', icon: BarChart3 },
    ],
  },
  SUPER_ADMIN: {
    primary: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Company', url: '/company', icon: Building2 },
      { title: 'Vehicles', url: '/vehicles', icon: Truck },
      { title: 'Drivers', url: '/drivers', icon: Users },
      { title: 'Contracts', url: '/contracts', icon: FileText },
    ],
    secondary: [
      { title: 'Broker Ops', url: '/broker', icon: Shield },
      { title: 'Marketplace', url: '/marketplace', icon: ShoppingCart },
      { title: 'Analytics', url: '/analytics', icon: BarChart3 },
      { title: 'Payments', url: '/payments', icon: CreditCard },
    ],
  },
  OPERATOR: {
    primary: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Company', url: '/company', icon: Building2 },
      { title: 'Vehicles', url: '/vehicles', icon: Truck },
      { title: 'Drivers', url: '/drivers', icon: Users },
      { title: 'Contracts', url: '/contracts', icon: FileText },
    ],
    secondary: [
      { title: 'Orders', url: '/orders', icon: Package },
      { title: 'Marketplace', url: '/marketplace', icon: ShoppingCart },
      { title: 'Broker Ops', url: '/broker', icon: Shield },
      { title: 'Analytics', url: '/analytics', icon: BarChart3 },
      { title: 'Payments', url: '/payments', icon: CreditCard },
    ],
  },
  ADMIN: {
    primary: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Company', url: '/company', icon: Building2 },
      { title: 'Contracts', url: '/contracts', icon: FileText },
      { title: 'Broker Ops', url: '/broker', icon: Shield },
    ],
    secondary: [
      { title: 'Marketplace', url: '/marketplace', icon: ShoppingCart },
      { title: 'Analytics', url: '/analytics', icon: BarChart3 },
      { title: 'Payments', url: '/payments', icon: CreditCard },
    ],
  },
};

const guestConfig: SidebarItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
];

function SidebarNavItem({ item, collapsed }: { item: SidebarItem; collapsed: boolean }) {
  const location = useLocation();
  const isActive = location.pathname === item.url;

  const content = (
    <SidebarMenuButton asChild>
      <NavLink
        to={item.url}
        end
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
          'hover:bg-sidebar-accent',
          isActive && 'bg-primary/10 text-primary shadow-sm'
        )}
        activeClassName="bg-primary/10 text-primary"
      >
        <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
        {!collapsed && <span>{item.title}</span>}
        {!collapsed && isActive && <ChevronRight className="ml-auto h-4 w-4 text-primary" />}
      </NavLink>
    </SidebarMenuButton>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { userRole } = useAuth();

  const config = userRole ? navConfig[userRole] : { primary: guestConfig, secondary: [] };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-base font-bold font-display text-foreground">FleetCommand</h1>
              <p className="text-[10px] text-muted-foreground">Logistics Platform</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 px-3 mb-1">Primary</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {config.primary.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarNavItem item={item} collapsed={collapsed} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {config.secondary.length > 0 && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 px-3 mb-1 mt-2">Additional</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {config.secondary.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarNavItem item={item} collapsed={collapsed} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarNavItem item={{ title: 'Settings', url: '/settings', icon: Settings }} collapsed={collapsed} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
