import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function IncidentsPage() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['incidents', status],
    queryFn: () => fetch(`/api/incidents${status ? `?status=${status}` : ''}`).then(r => r.json()),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3"><AlertTriangle className="text-amber-400" /> İnsidentlər</h1>
      <div className="flex gap-3 mb-4">
        <select className="input w-auto" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Bütün Status</option>
          <option value="OPEN">Açıq</option>
          <option value="CONTAINED">Lokallaşdırıldı</option>
          <option value="RESOLVED">Həll Edildi</option>
        </select>
      </div>
      <div className="card">
        {isLoading ? <p className="text-gray-500 py-8 text-center">Yüklənir...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-cyber-600/30 text-gray-400">
                <th className="text-left py-3 px-2">Başlıq</th><th className="text-left py-3 px-2">Aktiv</th><th className="text-left py-3 px-2">Kritiklik</th>
                <th className="text-left py-3 px-2">Status</th><th className="text-left py-3 px-2">Hesabat</th><th className="text-left py-3 px-2">Tarix</th>
              </tr></thead>
              <tbody>
                {data?.data?.map((inc: any) => (
                  <tr key={inc.id} className="border-b border-cyber-600/10 hover:bg-cyber-700/30">
                    <td className="py-3 px-2"><Link to={`/incidents/${inc.id}`} className="text-cyber-300 hover:underline">{inc.title}</Link></td>
                    <td className="py-3 px-2">{inc.vulnerability?.asset?.name || 'N/A'}</td>
                    <td className="py-3 px-2"><span className={`badge badge-${(inc.vulnerability?.criticality || 'medium').toLowerCase()}`}>{inc.vulnerability?.criticality || 'N/A'}</span></td>
                    <td className="py-3 px-2"><span className={`badge ${inc.status === 'OPEN' ? 'badge-critical' : inc.status === 'CONTAINED' ? 'badge-high' : 'badge-active'}`}>{inc.status}</span></td>
                    <td className="py-3 px-2">{inc.reports?.length || 0}</td>
                    <td className="py-3 px-2 text-gray-500 text-xs">{new Date(inc.createdAt).toLocaleString('az')}</td>
                  </tr>
                ))}
                {(!data?.data || data.data.length === 0) && <tr><td colSpan={6} className="py-8 text-center text-gray-500">İnsident yoxdur</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
