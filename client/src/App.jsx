import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import BatchList from './pages/BatchList';
import BatchDetail from './pages/BatchDetail';
import Dashboard from './pages/Dashboard';
import MeasurementForm from './pages/MeasurementForm';
import MealTracker from './pages/MealTracker';
import StreakDashboard from './pages/StreakDashboard';
import DailyActivity from './pages/DailyActivity';
import AuthPortal from './pages/AuthPortal';

import Learn from './pages/Learn';
import Messenger from './pages/Messenger';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBatchView from './pages/admin/AdminBatchView';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Toaster position="top-right" toastOptions={{ className: 'toast-custom', duration: 3000 }} />
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth" element={<AuthPortal />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/batches" element={<BatchList />} />
        <Route path="/batches/:id" element={<ProtectedRoute><BatchDetail /></ProtectedRoute>} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/:batchId" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/learn/:batchId" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
        <Route path="/measurements/:batchId" element={<ProtectedRoute><MeasurementForm /></ProtectedRoute>} />
        <Route path="/meals/:batchId" element={<ProtectedRoute><MealTracker /></ProtectedRoute>} />
        <Route path="/daily/:batchId" element={<ProtectedRoute><DailyActivity /></ProtectedRoute>} />
        <Route path="/streak/:batchId" element={<ProtectedRoute><StreakDashboard /></ProtectedRoute>} />
        <Route path="/messenger" element={<ProtectedRoute><Messenger /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/batch/:id" element={<AdminRoute><AdminBatchView /></AdminRoute>} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
