import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '../hooks/useWebSocket';
import { Shield, Bug, AlertTriangle, Brain, Activity, Globe, Wifi, WifiOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardData {
  totalAssets: number; activeVulnerabilities: number; openIncidents: number;
  autoResolvedPercent: number; riskTrend: { date: string; critical: number; high: number; medium: number }[];
  topCriticalAssets: { id: string; name: string; type: string; status: string }[];
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({ queryKey: ['dashboard'], queryFn: () => fetch('/api/dashboard').then(r => r.json()) });
  const { connected, events } = useWebSocket();

  const stats = [
    { label: 'Aktivlər', value: data?.totalAssets ?? 0, icon: Shield, color: 'text-cyber-400' },
    { label: 'Aktiv Zəifliklər', value: data?.activeVulnerabilities ?? 0, icon: Bug, color: 'text-red-400' },
    { label: 'Açıq İnsidentlər', value: data?.openIncidents ?? 0, icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Avtomatik Həll', value: `${data?.autoResolvedPercent ?? 0}%`, icon: Brain, color: 'text-green-400' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm">
          {connected ? <Wifi size={16} className="text-green-400" /> : <WifiOff size={16} className="text-red-400" />}
          <span className="text-gray-500">{connected ? 'Canlı' : 'Əlaqə kəsildi'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-cyber-700/50 ${s.color}`}><s.icon size={24} /></div>
            <div>
              <div className="text-2xl font-bold">{isLoading ? '...' : s.value}</div>
              <div className="text-sm text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Risk Trendi (7 gün)</h2>
          {data?.riskTrend && (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.riskTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243056" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #3b4a7a', borderRadius: '8px' }} />
                <Bar dataKey="critical" fill="#ef4444" name="Critical" stackId="a" />
                <Bar dataKey="high" fill="#f59e0b" name="High" stackId="a" />
                <Bar dataKey="medium" fill="#3b82f6" name="Medium" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Kritik Aktivlər</h2>
          {data?.topCriticalAssets?.map(a => (
            <div key={a.id} className="flex items-center justify-between py-2 border-b border-cyber-600/20 last:border-0">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-red-400" />
                <span className="text-sm truncate max-w-[140px]">{a.name}</span>
              </div>
              <span className="badge badge-critical text-[10px]">{a.type}</span>
            </div>
          ))}
          {(!data?.topCriticalAssets || data.topCriticalAssets.length === 0) && <p className="text-sm text-gray-500">Kritik aktiv yoxdur</p>}
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Canlı Hadisələr</h2>
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">Hələ heç bir hadisə gəlməyib. Zəiflik aşkarlanmasını gözləyin...</p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {events.slice(-20).reverse().map((e, i) => (
              <div key={i} className="text-xs text-gray-400 flex gap-2">
                <span className="text-cyber-400 shrink-0">{e.event}</span>
                <span className="truncate">{JSON.stringify(e.data).slice(0, 80)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
