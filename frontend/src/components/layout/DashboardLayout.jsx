import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard, Store, Scissors, Users, Calendar, Clock,
  ChevronLeft, ChevronRight, LogOut, Shield, BarChart3, UserCheck
} from 'lucide-react';
import { useState } from 'react';

const shopkeeperLinks = [
  { to: '/shopkeeper/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/shopkeeper/salon', icon: Store, label: 'My Salon' },
  { to: '/shopkeeper/services', icon: Scissors, label: 'Services' },
  { to: '/shopkeeper/staff', icon: Users, label: 'Staff' },
  { to: '/shopkeeper/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/shopkeeper/availability', icon: Clock, label: 'Availability' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/salons', icon: Store, label: 'Salons' },
  { to: '/admin/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

export default function DashboardLayout({ type = 'shopkeeper' }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = type === 'admin' ? adminLinks : shopkeeperLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="starry-dashboard flex h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r bg-card transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              {type === 'admin' ? <Shield className="h-5 w-5 text-primary" /> : <Store className="h-5 w-5 text-primary" />}
              <span className="font-semibold text-sm">
                {type === 'admin' ? 'Admin Panel' : 'Salon Panel'}
              </span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-2">
          {!collapsed && user && (
            <div className="px-3 py-2 text-xs text-muted-foreground mb-1">
              {user.name} ({user.role})
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex w-full items-center justify-start gap-3 text-sm font-medium text-muted-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Log out</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 border-b bg-background/80 px-6 py-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {type === 'admin' ? 'Platform administration' : 'Salon operations'}
            </p>
            <Badge variant="secondary" className="capitalize">{type}</Badge>
          </div>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
