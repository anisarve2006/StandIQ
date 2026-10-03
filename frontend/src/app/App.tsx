import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import ComponentPlayground from '../features/playground/ComponentPlayground';
import LayoutPlayground from '../features/playground/LayoutPlayground';
import { AppShell } from '../components/layout/AppShell';
import DashboardPage from '../features/dashboard/DashboardPage';
import ProcurementWorkspace from '../features/procurements/ProcurementWorkspace';
import RequirementUnderstandingPage from '../features/requirements/RequirementUnderstandingPage';
import StandardsDiscoveryPage from '../features/standards/StandardsDiscoveryPage';
import TenderHealthPage from '../features/tender-health/TenderHealthPage';
import ReviewVerifyPage from '../features/review/ReviewVerifyPage';
import KnowledgeGraphPage from '../features/graph/KnowledgeGraphPage';
import StandardsBasketPage from '../features/basket/StandardsBasketPage';
import SpecificationBuilderPage from '../features/specification/SpecificationBuilderPage';
import ApprovalPage from '../features/approval/ApprovalPage';
import ExportPage from '../features/export/ExportPage';
import ProcurementsPage from '../features/procurements/ProcurementsPage';
import ChangesAlertsPage from '../features/changes/ChangesAlertsPage';
import StandardDetailPage from '../features/standards/StandardDetailPage';
import EvidenceViewerPage from '../features/evidence/EvidenceViewerPage';
import TenderDiffPage from '../features/tender-diff/TenderDiffPage';
import SettingsPage from '../features/settings/SettingsPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import LandingPage from '../features/landing/LandingPage';
import { ProcurementProvider } from '../stores/procurement.store';
import { StandIQProvider } from '../stores/standiq.store';
import { AuthProvider, useAuth } from '../stores/auth.store';

// A simple protected route wrapper
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Authenticating...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <StandIQProvider>
      <ProcurementProvider>
        <AppShell />
      </ProcurementProvider>
    </StandIQProvider>
  );
}

// A wrapper for public routes (login/register) to prevent authenticated users from viewing them
function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading...</p>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />
      },
      {
        path: '/register',
        element: <RegisterPage />
      }
    ]
  },
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/landing',
    element: <LandingPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'procurements/new',
        element: <ProcurementWorkspace />,
      },
      {
        path: 'requirements',
        element: <RequirementUnderstandingPage />,
      },
      {
        path: 'procurements',
        element: <ProcurementsPage />,
      },
      {
        path: 'standards',
        element: <StandardsDiscoveryPage />,
      },
      {
        path: 'standards/:standardId',
        element: <StandardDetailPage />,
      },
      {
        path: 'tender-health',
        element: <TenderHealthPage />,
      },
      {
        path: 'tender-diff',
        element: <TenderDiffPage />,
      },
      {
        path: 'review',
        element: <ReviewVerifyPage />,
      },
      {
        path: 'evidence',
        element: <EvidenceViewerPage />,
      },
      {
        path: 'graph',
        element: <KnowledgeGraphPage />,
      },
      {
        path: 'basket',
        element: <StandardsBasketPage />,
      },
      {
        path: 'specification-builder',
        element: <SpecificationBuilderPage />,
      },
      {
        path: 'approval',
        element: <ApprovalPage />,
      },
      {
        path: 'export',
        element: <ExportPage />,
      },
      {
        path: 'changes',
        element: <ChangesAlertsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'components',
        element: <ComponentPlayground />,
      },
      {
        path: 'layout',
        element: <LayoutPlayground />,
      },
    ]
  }
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
