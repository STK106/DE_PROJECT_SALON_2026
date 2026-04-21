import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import ModeToggle from '@/components/mode-toggle';
import { Scissors, Menu, X, LogOut, User, Calendar, LayoutDashboard, ShoppingCart, Package } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'shopkeeper') return '/shopkeeper';
    return '/my-bookings';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Scissors className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">GlowBook</span>
            <Badge variant="secondary" className="hidden sm:inline-flex">Salon Booking</Badge>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <ModeToggle />
          {user ? (
            <>
              {user.role === 'user' && (
                <>
                  <Link to="/my-bookings" className="text-sm font-medium hover:text-primary transition-colors">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> My Bookings</span>
                  </Link>
                  <Link to="/my-product-orders" className="text-sm font-medium hover:text-primary transition-colors">
                    <span className="flex items-center gap-1"><Package className="h-4 w-4" /> My Orders</span>
                  </Link>
                  <Link to="/cart" className="text-sm font-medium hover:text-primary transition-colors">
                    <span className="flex items-center gap-1"><ShoppingCart className="h-4 w-4" /> Cart</span>
                  </Link>
                </>
              )}
              <Link to={getDashboardLink()} className="text-sm font-medium hover:text-primary transition-colors">
                <span className="flex items-center gap-1"><LayoutDashboard className="h-4 w-4" /> Dashboard</span>
              </Link>
              <Link to="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                <span className="flex items-center gap-1"><User className="h-4 w-4" /> Profile</span>
              </Link>
              <Separator orientation="vertical" className="h-5" />
              <div className="flex items-center gap-3">
                <Avatar
                  fallback={user.name?.charAt(0).toUpperCase()}
                  className="h-8 w-8"
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={() => navigate('/login')}>Log in</Button>
              <Button onClick={() => navigate('/register')}>Sign up</Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <Button
          className="md:hidden"
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur p-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg border bg-card p-3">
            <span className="text-sm font-medium">Theme</span>
            <ModeToggle />
          </div>
          <Link to="/" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Home</Link>
          {user ? (
            <>
              <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <Avatar
                  fallback={user.name?.charAt(0).toUpperCase()}
                  className="h-9 w-9"
                />
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
              {user.role === 'user' && (
                <>
                  <Link to="/my-bookings" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>My Bookings</Link>
                  <Link to="/my-product-orders" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>My Orders</Link>
                  <Link to="/cart" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Cart</Link>
                </>
              )}
              <Link to={getDashboardLink()} className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link to="/profile" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Profile</Link>
              <Button variant="outline" className="w-full" onClick={handleLogout}>Log out</Button>
            </>
          ) : (
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Log in</Button>
              <Button className="w-full" onClick={() => { navigate('/register'); setMobileOpen(false); }}>Sign up</Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
