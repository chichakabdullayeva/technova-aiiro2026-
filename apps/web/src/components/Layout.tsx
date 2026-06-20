import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  LayoutDashboard, Shield, Globe, Bug, Brain, Activity, Target, Code, AlertTriangle,
  FileText, BookOpen, Settings, ScrollText, LogOut, Menu, X, Wifi, WifiOff
} from 'lucide-react';
import clsx from 'clsx';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assets', label: 'Aktivlər', icon: Shield },
  { to: '/threat-feed', label: 'Təhdid Kəşfiyyatı', icon: Globe },
  { to: '/vulnerabilities', label: 'Zəifliklər', icon: Bug },
  { to: '/ai-decisions', label: 'AI Qərarları', icon: Brain },
  { to: '/remediation', label: 'SOAR Remediasiya', icon: Activity },
  { to: '/bas', label: 'BAS Simulyasiya', icon: Target },
  { to: '/devsecops', label: 'DevSecOps', icon: Code },
  { to: '/incidents', label: 'İnsidentlər', icon: AlertTriangle },
  { to: '/reports', label: 'Hesabatlar', icon: FileText },
  { to: '/knowledge-base', label: 'Bilik Bazası', icon: BookOpen },
  { to: '/settings', label: 'Parametrlər', icon: Settings },
  { to: '/audit-log', label: 'Audit Jurnalı', icon: ScrollText },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { connected } = useWebSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={clsx('fixed lg:static inset-y-0 left-0 z-30 w-64 bg-cyber-800 border-r border-cyber-600/30 transform transition-transform lg:translate-x-0 overflow-y-auto', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="p-4 border-b border-cyber-600/30 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Shield className="text-cyber-400" size={24} />
            <span className="font-bold text-lg tracking-tight">Kiber-DNT</span>
          </Link>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-1">
          {links.map(l => {
            const active = pathname === l.to || pathname.startsWith(l.to + '/');
            return (
              <Link key={l.to} to={l.to} onClick={() => setSidebarOpen(false)}
                className={clsx('sidebar-link', active ? 'bg-cyber-600 text-cyber-200' : 'text-gray-400 hover:bg-cyber-700 hover:text-gray-200')}>
                <l.icon size={18} />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyber-600/30 bg-cyber-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {connected ? <Wifi size={14} className="text-green-400" /> : <WifiOff size={14} className="text-red-400" />}
              <span className="text-xs text-gray-500">{connected ? 'Bağlı' : 'Qırıldı'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-sm text-gray-300 truncate">{user?.name || user?.email}</div>
              <div className="text-xs text-cyber-400">{user?.role}</div>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-cyber-900/80 backdrop-blur-sm border-b border-cyber-600/30 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white"><Menu size={20} /></button>
          <Shield className="text-cyber-400" size={20} />
          <span className="font-bold">Kiber-DNT</span>
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
