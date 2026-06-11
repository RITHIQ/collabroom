import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { store } from './store';
import { initTheme } from './store/slices/themeSlice';
import { restoreSession } from './store/slices/authSlice';
import { useAppDispatch, useAppSelector } from './store';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';
import NotFound from './pages/NotFound';

// App Pages
import Dashboard from './pages/Dashboard';
import DiscoverCreators from './pages/DiscoverCreators';
import DiscoverBrands from './pages/DiscoverBrands';
import Campaigns from './pages/Campaigns';
import CampaignRoom from './pages/CampaignRoom';
import CampaignCreate from './pages/CampaignCreate';
import Contracts from './pages/Contracts';
import ContractSign from './pages/ContractSign';
import ContractDetail from './pages/ContractDetail';
import WalletPage from './pages/WalletPage';
import AIBrief from './pages/AIBrief';
import ProfileEdit from './pages/ProfileEdit';
import ProfileView from './pages/ProfileView';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import MessagesPage from './pages/MessagesPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCampaigns from './pages/admin/AdminCampaigns';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';

import SupportAssistant from './components/SupportAssistant';

function AppInit({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(initTheme());
    dispatch(restoreSession()); // Restore Supabase session on load
  }, [dispatch]);
  return <>{children}</>;
}

/** Guard: must be logged in (any role) */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAppSelector(s => s.auth);
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Guard: admin role only */
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAppSelector(s => s.auth);
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppInit>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                boxShadow: 'var(--shadow-dropdown)',
              },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
            <Route path="/contracts/sign/:id" element={<ContractSign />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            {/* Admin — protected by role guard */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="campaigns" element={<AdminCampaigns />} />
              <Route path="disputes" element={<AdminDisputes />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
            </Route>

            {/* Authenticated user routes */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/discover/creators" element={<DiscoverCreators />} />
              <Route path="/discover/brands" element={<DiscoverBrands />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/new" element={<CampaignCreate />} />
              <Route path="/campaigns/:id" element={<CampaignRoom />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/contracts/:id" element={<ContractDetail />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/payments" element={<WalletPage />} />
              <Route path="/ai-brief" element={<AIBrief />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />
              <Route path="/profile/:username" element={<ProfileView />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallbacks */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SupportAssistant />
        </AppInit>
      </BrowserRouter>
    </Provider>
  );
}