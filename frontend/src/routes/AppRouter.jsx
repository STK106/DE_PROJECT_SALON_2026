import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/common/ProtectedRoute';

// Layouts
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// User Pages
import HomePage from '@/pages/user/HomePage';
import SalonDetailsPage from '@/pages/user/SalonDetailsPage';
import BookingPage from '@/pages/user/BookingPage';
import MyBookingsPage from '@/pages/user/MyBookingsPage';
import ProfilePage from '@/pages/user/ProfilePage';

// Shopkeeper Pages
import ShopkeeperDashboard from '@/pages/shopkeeper/Dashboard';
import ManageSalon from '@/pages/shopkeeper/ManageSalon';
import ManageServices from '@/pages/shopkeeper/ManageServices';
import ManageStaff from '@/pages/shopkeeper/ManageStaff';
import ManageBookings from '@/pages/shopkeeper/ManageBookings';
import Availability from '@/pages/shopkeeper/Availability';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import ManageUsers from '@/pages/admin/ManageUsers';
import ManageSalons from '@/pages/admin/ManageSalons';
import AdminManageBookings from '@/pages/admin/ManageBookings';
import Reports from '@/pages/admin/Reports';

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
        <Route path="/salons/:id" element={<PublicLayout><SalonDetailsPage /></PublicLayout>} />

        {/* User Protected Routes */}
        <Route path="/book/:salonId" element={
          <ProtectedRoute roles={['user']}>
            <PublicLayout><BookingPage /></PublicLayout>
          </ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute roles={['user']}>
            <PublicLayout><MyBookingsPage /></PublicLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute roles={['user', 'shopkeeper', 'admin']}>
            <PublicLayout><ProfilePage /></PublicLayout>
          </ProtectedRoute>
        } />

        {/* Shopkeeper Routes */}
        <Route path="/shopkeeper" element={
          <ProtectedRoute roles={['shopkeeper']}>
            <DashboardLayout type="shopkeeper" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ShopkeeperDashboard />} />
          <Route path="salon" element={<ManageSalon />} />
          <Route path="services" element={<ManageServices />} />
          <Route path="staff" element={<ManageStaff />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="availability" element={<Availability />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout type="admin" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="salons" element={<ManageSalons />} />
          <Route path="bookings" element={<AdminManageBookings />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={
          <PublicLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-muted-foreground mb-6">Page not found</p>
              <a href="/" className="text-primary underline">Go Home</a>
            </div>
          </PublicLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
