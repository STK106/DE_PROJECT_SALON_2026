import { Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 md:items-center">
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Scissors className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold">GlowBook</span>
              <Badge variant="secondary">Trusted Salons</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Find nearby salons, compare services, and book instantly.
            </p>
          </div>

          <nav className="flex flex-wrap gap-5 text-sm text-muted-foreground md:justify-center">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Register</Link>
          </nav>

          <div className="md:justify-self-end">
            <Button asChild variant="outline" size="sm">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
        <Separator className="my-6" />
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GlowBook. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
