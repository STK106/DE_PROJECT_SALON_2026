import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import AppRouter from '@/routes/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </AuthProvider>
  );
}
