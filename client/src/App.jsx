import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
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
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'toast-custom', duration: 3000 }} />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/batches" element={<BatchList />} />
        <Route path="/batches/:id" element={<ProtectedRoute><BatchDetail /></ProtectedRoute>} />
        <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/:batchId" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/measurements/:batchId" element={<ProtectedRoute><MeasurementForm /></ProtectedRoute>} />
        <Route path="/meals/:batchId" element={<ProtectedRoute><MealTracker /></ProtectedRoute>} />
        <Route path="/streak/:batchId" element={<ProtectedRoute><StreakDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </>
  );
}

export default App;
