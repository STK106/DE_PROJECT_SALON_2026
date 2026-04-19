import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { Scissors, Menu, X, LogOut, User, Calendar, LayoutDashboard } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <Scissors className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">GlowBook</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          {user ? (
            <>
              {user.role === 'user' && (
                <Link to="/my-bookings" className="text-sm font-medium hover:text-primary transition-colors">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> My Bookings</span>
                </Link>
              )}
              <Link to={getDashboardLink()} className="text-sm font-medium hover:text-primary transition-colors">
                <span className="flex items-center gap-1"><LayoutDashboard className="h-4 w-4" /> Dashboard</span>
              </Link>
              <Link to="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                <span className="flex items-center gap-1"><User className="h-4 w-4" /> Profile</span>
              </Link>
              <div className="flex items-center gap-3">
                <Avatar
                  fallback={user.name?.charAt(0).toUpperCase()}
                  className="h-8 w-8"
                />
                <span className="text-sm font-medium">{user.name}</span>
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
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-3">
          <Link to="/" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Home</Link>
          {user ? (
            <>
              {user.role === 'user' && (
                <Link to="/my-bookings" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>My Bookings</Link>
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
