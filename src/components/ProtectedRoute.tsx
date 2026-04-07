import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const [graceExpired, setGraceExpired] = useState(false);

  // Wait 300ms before deciding to redirect — absorbs Supabase cold-start latency
  // and prevents flash redirects when the session token is being validated
  useEffect(() => {
    const timer = setTimeout(() => setGraceExpired(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Still loading or within the grace window → show spinner
  if (loading || !graceExpired) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
