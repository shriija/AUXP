import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Forum from './pages/Forum';
import ForumPostView from './pages/ForumPostView';
import Classrooms from './pages/Classrooms';
import ClassroomRoom from './pages/ClassroomRoom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
            <Route path="*" element={<div className="flex flex-1 items-center justify-center"><h1 className="text-3xl font-bold tracking-tight">404 - Not Found</h1></div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
