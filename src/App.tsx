import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ui/Toast';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ErrorBoundary } from './components/ErrorBoundary';

import { Dashboard } from './pages/Dashboard';
import { ConfigPage } from './pages/ConfigPage';
import { KanbanPage } from './pages/KanbanPage';
import { NovoLead } from './pages/NovoLead';
import { FinancasPage } from './pages/FinancasPage';
import { ClientesListaPage } from './pages/ClientesListaPage';
import { N8nToolsPage } from './pages/N8nToolsPage';

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ToastContainer />
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                <Route path="/clientes" element={<ErrorBoundary><KanbanPage /></ErrorBoundary>} />
                <Route path="/clientes/lista" element={<ErrorBoundary><ClientesListaPage /></ErrorBoundary>} />
                <Route path="/clientes/novo" element={<ErrorBoundary><NovoLead /></ErrorBoundary>} />
                <Route path="/configuracoes" element={<ErrorBoundary><ConfigPage /></ErrorBoundary>} />
                <Route path="/financas" element={<ErrorBoundary><FinancasPage /></ErrorBoundary>} />
                <Route path="/n8n-tools" element={<ErrorBoundary><N8nToolsPage /></ErrorBoundary>} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
