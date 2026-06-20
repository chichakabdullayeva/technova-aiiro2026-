import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bug, Brain, Activity, Target } from 'lucide-react';

export default function VulnDetailPage() {
  const { id } = useParams();
  const { data: v, isLoading } = useQuery({
    queryKey: ['vulnerability', id],
    queryFn: () => fetch(`/api/vulnerabilities/${id}`).then(r => r.json()),
  });

  if (isLoading) return <p className="text-gray-500">Yüklənir...</p>;
  if (!v || v.detail) return <p className="text-gray-500">{v?.detail || 'Zəiflik tapılmadı'}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3"><Bug className="text-red-400" />Zəiflik Detayı</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card"><h3 className="text-sm text-gray-400 mb-1">CVSS</h3><p className="text-2xl font-bold text-red-400">{v.cvssScore}</p></div>
        <div className="card"><h3 className="text-sm text-gray-400 mb-1">EPSS</h3><p className="text-2xl font-bold text-amber-400">{(v.epssScore * 100).toFixed(1)}%</p></div>
        <div className="card"><h3 className="text-sm text-gray-400 mb-1">Etibar</h3><p className="text-2xl font-bold text-cyber-400">{v.confidenceScore}%</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Brain size={16} className="text-cyber-400" /> AI Qərarları</h2>
          {v.aiDecisions?.map((d: any) => (
            <div key={d.id} className="py-2 border-b border-cyber-600/10 last:border-0 text-sm">
              <span className={d.autoExecute ? 'text-green-400' : 'text-amber-400'}>{d.recommendedAction}</span>
              <p className="text-xs text-gray-500">{d.reasoning?.slice(0, 100)}</p>
            </div>
          )) || <p className="text-sm text-gray-500">Qərar yoxdur</p>}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Activity size={16} className="text-green-400" /> Remediasiyalar</h2>
          {v.remediations?.map((r: any) => (
            <div key={r.id} className="py-2 border-b border-cyber-600/10 last:border-0 text-sm">
              <p>{r.actionType} - {r.status}</p>
              <p className="text-xs text-gray-500">{r.details}</p>
            </div>
          )) || <p className="text-sm text-gray-500">Remediasiya yoxdur</p>}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><Target size={16} className="text-purple-400" /> BAS Simulyasiyaları</h2>
        {v.basSimulations?.map((b: any) => (
          <div key={b.id} className="py-2 border-b border-cyber-600/10 last:border-0 text-sm">
            <p>{b.scenario} → <span className={b.result === 'confirmed_exploitable' ? 'text-red-400' : 'text-green-400'}>{b.result}</span></p>
            <p className="text-xs text-gray-500">{new Date(b.completedAt || b.createdAt).toLocaleString('az')}</p>
          </div>
        )) || <p className="text-sm text-gray-500">Simulyasiya yoxdur</p>}
      </div>
    </div>
  );
}
