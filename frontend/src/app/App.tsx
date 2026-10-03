import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
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
import { ProcurementProvider } from '../stores/procurement.store';
import { StandIQProvider } from '../stores/standiq.store';

import LandingPage from '../features/landing/LandingPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/landing',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AppShell />,
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
    <StandIQProvider>
      <ProcurementProvider>
        <RouterProvider router={router} />
      </ProcurementProvider>
    </StandIQProvider>
  );
}
