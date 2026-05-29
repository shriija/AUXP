import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { ShieldAlert } from 'lucide-react';
import ConcernModal from './components/ConcernModal';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Forum from './pages/Forum';
import ForumPostView from './pages/ForumPostView';
import Classrooms from './pages/Classrooms';
import ClassroomRoom from './pages/ClassroomRoom';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import ToastContainer from './components/ToastContainer';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isConcernOpen, setIsConcernOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col">
      {!isLandingPage && <Navbar />}
      <ToastContainer />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum"
            element={
              <ProtectedRoute>
                <Forum />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/:id"
            element={
              <ProtectedRoute>
                <ForumPostView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classrooms"
            element={
              <ProtectedRoute>
                <Classrooms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classrooms/:id"
            element={
              <ProtectedRoute>
                <ClassroomRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="*" element={<div className="flex flex-1 items-center justify-center"><h1 className="text-3xl font-bold tracking-tight">404 - Not Found</h1></div>} />
         </Routes>
      </main>
      
      {isAuthenticated && (
        <>
          <button
            onClick={() => setIsConcernOpen(true)}
            className="fixed bottom-6 right-6 z-[40] bg-red-500 hover:bg-red-650 text-white font-black py-2.5 px-4 rounded-none border-2 border-slate-900 shadow-neo hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-2 text-xs uppercase font-mono tracking-wider cursor-pointer"
            title="Raise Concern / Report Issue"
          >
            <ShieldAlert className="w-4.5 h-4.5" />
            Raise Concern
          </button>
          <ConcernModal isOpen={isConcernOpen} onClose={() => setIsConcernOpen(false)} />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
