import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';

export default function IncidentDetailPage() {
  const { id } = useParams();
  const { data: inc, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => fetch(`/api/incidents/${id}`).then(r => r.json()),
  });

  if (isLoading) return <p className="text-gray-500">Yüklənir...</p>;
  if (!inc || inc.detail) return <p className="text-gray-500">{inc?.detail || 'İnsident tapılmadı'}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3"><AlertTriangle className="text-amber-400" />{inc.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card"><h3 className="text-sm text-gray-400 mb-1">Status</h3><p className={`font-semibold ${inc.status === 'OPEN' ? 'text-red-400' : inc.status === 'CONTAINED' ? 'text-amber-400' : 'text-green-400'}`}>{inc.status}</p></div>
        <div className="card"><h3 className="text-sm text-gray-400 mb-1">Aktiv</h3><p>{inc.vulnerability?.asset?.name || 'N/A'} ({inc.vulnerability?.asset?.type || 'N/A'})</p></div>
        <div className="card"><h3 className="text-sm text-gray-400 mb-1">Təhdid</h3><p>{inc.vulnerability?.threatFeedItem?.title || 'N/A'}</p></div>
        <div className="card"><h3 className="text-sm text-gray-400 mb-1">CVSS / EPSS</h3><p className="font-mono">{inc.vulnerability?.cvssScore} / {(inc.vulnerability?.epssScore * 100).toFixed(1)}%</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h2 className="font-semibold mb-3">AI Qərarları</h2>
          {inc.vulnerability?.aiDecisions?.map((d: any) => (
            <div key={d.id} className="py-2 text-sm">
              <p className={`font-medium ${d.recommendedAction === 'auto_isolate' ? 'text-red-400' : 'text-amber-400'}`}>{d.recommendedAction}</p>
              <p className="text-xs text-gray-500">{d.reasoning?.slice(0, 150)}</p>
            </div>
          )) || <p className="text-sm text-gray-500">Qərar yoxdur</p>}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Remediasiyalar</h2>
          {inc.vulnerability?.remediations?.map((r: any) => (
            <div key={r.id} className="py-2 text-sm">
              <p>{r.actionType} - <span className={r.status === 'COMPLETED' ? 'text-green-400' : 'text-amber-400'}>{r.status}</span></p>
              <p className="text-xs text-gray-500">{r.details?.slice(0, 100)}</p>
            </div>
          )) || <p className="text-sm text-gray-500">Remediasiya yoxdur</p>}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-3">Hesabatlar ({inc.reports?.length || 0})</h2>
        {inc.reports?.map((r: any) => (
          <details key={r.id} className="mb-2">
            <summary className="text-sm text-cyber-300 cursor-pointer hover:text-cyber-200">
              {new Date(r.createdAt).toLocaleString('az')} - {r.generatedBy}
            </summary>
            <div className="mt-2 p-3 bg-cyber-900 rounded text-xs font-mono text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto">{r.content}</div>
          </details>
        )) || <p className="text-sm text-gray-500">Hesabat yoxdur</p>}
      </div>
    </div>
  );
}
