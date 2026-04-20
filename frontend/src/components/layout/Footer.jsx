import { ArrowRight, Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="border-t bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_34%),linear-gradient(to_bottom,var(--background),hsl(var(--muted)/0.28))]">
      <div className="container mx-auto px-4 py-12 sm:py-14 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/80">Explore</h3>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
              <Link to="/register" className="transition-colors hover:text-foreground">Create account</Link>
              <Link to="/login" className="transition-colors hover:text-foreground">Sign in</Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/80">Support</h3>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                support@glowbook.com
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                +1 (555) 012-2026
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                24 Salon Avenue, Downtown
              </span>
            </nav>
          </div>

          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/80">Newsletter</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Get style tips, booking updates, and salon offers in your inbox.
            </p>
            <form className="space-y-3" onSubmit={(event) => event.preventDefault()}>
              <div className="flex gap-2">
                <Input type="email" placeholder="Email address" aria-label="Email address" />
                <Button type="submit" size="icon" aria-label="Subscribe to newsletter">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <div className="flex items-center gap-2 text-muted-foreground">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="rounded-full border p-2 transition-colors hover:border-primary hover:text-primary">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="rounded-full border p-2 transition-colors hover:border-primary hover:text-primary">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="rounded-full border p-2 transition-colors hover:border-primary hover:text-primary">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} GlowBook. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link to="/" className="transition-colors hover:text-foreground">Terms</Link>
            <Link to="/" className="transition-colors hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
