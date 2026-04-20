import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import AppRouter from '@/routes/AppRouter';
import { ThemeProvider } from '@/components/theme-provider';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--card)',
              color: 'var(--card-foreground)',
              border: '1px solid var(--border)',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
