import { Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Scissors className="h-5 w-5 text-primary" />
            <span className="font-semibold">GlowBook</span>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Register</Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GlowBook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
