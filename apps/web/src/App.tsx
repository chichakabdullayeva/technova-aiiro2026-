import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AssetsPage from './pages/AssetsPage';
import AssetDetailPage from './pages/AssetDetailPage';
import ThreatFeedPage from './pages/ThreatFeedPage';
import VulnerabilitiesPage from './pages/VulnerabilitiesPage';
import VulnDetailPage from './pages/VulnDetailPage';
import AIDecisionsPage from './pages/AIDecisionsPage';
import RemediationPage from './pages/RemediationPage';
import BASPage from './pages/BASPage';
import DevSecOpsPage from './pages/DevSecOpsPage';
import IncidentsPage from './pages/IncidentsPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import ReportsPage from './pages/ReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import SettingsPage from './pages/SettingsPage';
import AuditLogPage from './pages/AuditLogPage';

function AppLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

function P({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<P><AppLayout><DashboardPage /></AppLayout></P>} />
      <Route path="/dashboard" element={<P><AppLayout><DashboardPage /></AppLayout></P>} />
      <Route path="/assets" element={<P><AppLayout><AssetsPage /></AppLayout></P>} />
      <Route path="/assets/:id" element={<P><AppLayout><AssetDetailPage /></AppLayout></P>} />
      <Route path="/threat-feed" element={<P><AppLayout><ThreatFeedPage /></AppLayout></P>} />
      <Route path="/vulnerabilities" element={<P><AppLayout><VulnerabilitiesPage /></AppLayout></P>} />
      <Route path="/vulnerabilities/:id" element={<P><AppLayout><VulnDetailPage /></AppLayout></P>} />
      <Route path="/ai-decisions" element={<P><AppLayout><AIDecisionsPage /></AppLayout></P>} />
      <Route path="/remediation" element={<P><AppLayout><RemediationPage /></AppLayout></P>} />
      <Route path="/bas" element={<P><AppLayout><BASPage /></AppLayout></P>} />
      <Route path="/devsecops" element={<P><AppLayout><DevSecOpsPage /></AppLayout></P>} />
      <Route path="/incidents" element={<P><AppLayout><IncidentsPage /></AppLayout></P>} />
      <Route path="/incidents/:id" element={<P><AppLayout><IncidentDetailPage /></AppLayout></P>} />
      <Route path="/reports" element={<P><AppLayout><ReportsPage /></AppLayout></P>} />
      <Route path="/reports/:id" element={<P><AppLayout><ReportDetailPage /></AppLayout></P>} />
      <Route path="/knowledge-base" element={<P><AppLayout><KnowledgeBasePage /></AppLayout></P>} />
      <Route path="/settings" element={<P><AppLayout><SettingsPage /></AppLayout></P>} />
      <Route path="/audit-log" element={<P><AppLayout><AuditLogPage /></AppLayout></P>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
