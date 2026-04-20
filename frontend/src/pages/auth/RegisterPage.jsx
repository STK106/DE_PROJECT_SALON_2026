import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Scissors, UserRound, Store, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const SALON_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=900&auto=format&fit=crop&q=85',
    alt: 'Stylish unisex salon interior',
  },
  {
    src: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=900&auto=format&fit=crop&q=85',
    alt: 'Professional hairstylist cutting hair',
  },
  {
    src: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=900&auto=format&fit=crop&q=85',
    alt: 'Hair coloring and treatment',
  },
  {
    src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&auto=format&fit=crop&q=85',
    alt: 'Barber giving precise haircut',
  },
  {
    src: 'https://images.unsplash.com/photo-1470259078422-826894b933aa?w=900&auto=format&fit=crop&q=85',
    alt: 'Elegant salon styling station',
  },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState(0);
  const [fading, setFading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const goTo = useCallback((idx) => {
    setFading(true);
    setTimeout(() => {
      setSlide(idx);
      setFading(false);
    }, 300);
  }, []);

  const prev = () => goTo((slide - 1 + SALON_SLIDES.length) % SALON_SLIDES.length);
  const next = useCallback(() => goTo((slide + 1) % SALON_SLIDES.length), [slide, goTo]);

  useEffect(() => {
    const t = setTimeout(next, 2000);
    return () => clearTimeout(t);
  }, [next]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      const res = await authService.register(data);
      login(res.data.token, res.data.user);
      toast.success('Account created successfully!');
      if (res.data.user.role === 'shopkeeper') navigate('/shopkeeper');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">

        {/* signup-04 two-column card */}
        <Card className="overflow-hidden p-0 shadow-lg">
          <CardContent className="grid p-0 md:grid-cols-2">

            {/* ─── Left: form panel ─── */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-5">

              {/* heading */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Scissors className="h-4 w-4" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">GlowBook</span>
                </div>
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Join GlowBook and book your perfect look
                </p>
              </div>

              {/* fields */}
              <div className="flex flex-col gap-4">

                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                {/* Role picker */}
                <div className="flex flex-col gap-2">
                  <Label>I am a</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setForm({ ...form, role: 'user' })}
                      className={`justify-start gap-2 ${
                        form.role === 'user'
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <UserRound className="h-4 w-4 shrink-0" /> Customer
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setForm({ ...form, role: 'shopkeeper' })}
                      className={`justify-start gap-2 ${
                        form.role === 'shopkeeper'
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Store className="h-4 w-4 shrink-0" /> Salon Owner
                    </Button>
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 6 characters"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create account'}
                </Button>

                {/* separator */}
                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    Or continue with
                  </span>
                </div>

                {/* social buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" type="button" aria-label="Sign up with Apple">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zm4.378-7.066c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" fill="currentColor" />
                    </svg>
                  </Button>
                  <Button variant="outline" type="button" aria-label="Sign up with Google">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
                    </svg>
                  </Button>
                  <Button variant="outline" type="button" aria-label="Sign up with Meta">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                      <path d="M6.915 4.03c-1.968 0-3.683 1.068-4.712 2.686C1.047 8.34.3 10.69.3 13.26c0 .706.07 1.369.21 1.973.14.604.35 1.178.63 1.706a5.6 5.6 0 0 0 1.148 1.547c.526.5 1.178.907 1.92 1.184.744.28 1.56.42 2.408.42.93 0 1.79-.163 2.558-.481a5.61 5.61 0 0 0 1.96-1.372c.52-.587.919-1.28 1.186-2.055a8.08 8.08 0 0 0 .399-2.54c0-.19-.008-.375-.025-.552l-.005-.077-.002-.027a7.88 7.88 0 0 0-.206-1.355c.463-.124.895-.272 1.293-.445.397-.171.759-.374 1.084-.608.327-.234.614-.504.857-.81.243-.304.44-.643.584-1.01.143-.368.215-.773.215-1.214 0-.594-.117-1.172-.35-1.73a5.065 5.065 0 0 0-.963-1.5 4.547 4.547 0 0 0-1.471-1.035 4.33 4.33 0 0 0-1.852-.395c-.965 0-1.867.26-2.656.766a5.386 5.386 0 0 0-1.863 2.046 5.374 5.374 0 0 0-1.857-2.045C8.78 4.29 7.88 4.03 6.915 4.03zm0 1.782c.69 0 1.316.185 1.87.55.553.362 1.003.89 1.337 1.56.336.674.506 1.468.506 2.363 0 .895-.17 1.69-.506 2.363-.334.673-.784 1.198-1.337 1.56a3.336 3.336 0 0 1-1.87.55c-.691 0-1.317-.183-1.87-.55-.553-.362-1.003-.887-1.337-1.56-.334-.672-.505-1.468-.505-2.363 0-.895.171-1.689.505-2.362.334-.672.784-1.198 1.337-1.56.553-.366 1.179-.551 1.87-.551zm10.245 0c.69 0 1.316.185 1.87.55.553.362 1.003.89 1.337 1.56.336.674.506 1.468.506 2.363 0 .895-.17 1.69-.506 2.363-.334.673-.784 1.198-1.337 1.56a3.336 3.336 0 0 1-1.87.55c-.69 0-1.316-.183-1.87-.55-.553-.362-1.003-.887-1.337-1.56-.334-.672-.505-1.468-.505-2.363 0-.895.171-1.689.505-2.362.334-.672.784-1.198 1.337-1.56.554-.366 1.18-.551 1.87-.551z" fill="currentColor" />
                    </svg>
                  </Button>
                </div>
              </div>

              {/* footer link */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="underline underline-offset-4 font-medium text-foreground hover:text-primary">
                  Sign in
                </Link>
              </p>
            </form>

            {/* ─── Right: image slider panel (hidden on mobile) ─── */}
            <div className="relative hidden md:flex flex-col overflow-hidden select-none">

              {/* slides */}
              {SALON_SLIDES.map((s, i) => (
                <img
                  key={s.src}
                  src={s.src}
                  alt={s.alt}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                    i === slide ? (fading ? 'opacity-0' : 'opacity-100') : 'opacity-0'
                  }`}
                />
              ))}

              {/* dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/65" />

              {/* brand badge */}
              <div className="relative z-10 p-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm border border-white/20">
                  <Scissors className="h-3 w-3" /> GlowBook
                </span>
              </div>

              {/* prev / next arrows */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 z-20 h-7 w-7 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm hover:bg-black/50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={next}
                aria-label="Next image"
                className="absolute right-3 top-1/2 z-20 h-7 w-7 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm hover:bg-black/50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* dot indicators */}
              <div className="absolute bottom-14 left-1/2 z-20 -translate-x-1/2 flex gap-1.5">
                {SALON_SLIDES.map((_, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-1.5 min-h-1.5 w-auto min-w-0 rounded-full p-0 transition-all duration-300 hover:bg-transparent ${
                      i === slide ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              {/* bottom quote */}
              <div className="relative z-10 mt-auto p-6 text-white">
                <blockquote className="text-sm font-light leading-relaxed italic opacity-90">
                  &ldquo;Beauty begins the moment you decide to be yourself.&rdquo;
                </blockquote>
                <p className="mt-1 text-xs opacity-60">— Coco Chanel</p>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* terms */}
        <p className="mx-auto mt-4 max-w-xs text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{' '}
          <a href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
