import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Truck, Users, Settings, Package,
  FileText, MapPin, CreditCard, BarChart3, Shield, ChevronRight,
} from 'lucide-react';
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

const operationItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Company', url: '/company', icon: Building2 },
  { title: 'Vehicles', url: '/vehicles', icon: Truck },
  { title: 'Drivers', url: '/drivers', icon: Users },
];

const futureItems = [
  { title: 'Orders', url: '/orders', icon: Package },
  { title: 'Contracts', url: '/contracts', icon: FileText },
  { title: 'Tracking', url: '/tracking', icon: MapPin },
  { title: 'Payments', url: '/payments', icon: CreditCard },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Broker Ops', url: '/broker', icon: Shield },
];

function SidebarNavItem({ item, collapsed }: { item: typeof operationItems[0]; collapsed: boolean }) {
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
          {!collapsed && <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 px-3 mb-1">Operations</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {operationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarNavItem item={item} collapsed={collapsed} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 px-3 mb-1 mt-2">Modules</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {futureItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarNavItem item={item} collapsed={collapsed} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
