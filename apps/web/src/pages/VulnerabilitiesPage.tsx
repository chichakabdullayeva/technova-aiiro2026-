import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bug, Search } from 'lucide-react';

export default function VulnerabilitiesPage() {
  const [status, setStatus] = useState('');
  const [criticality, setCriticality] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['vulnerabilities', status, criticality],
    queryFn: () => fetch(`/api/vulnerabilities?status=${status}&criticality=${criticality}`).then(r => r.json()),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Zəifliklər</h1>
      </div>

      <div className="flex gap-3 mb-4">
        <select className="input w-auto" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Bütün Status</option>
          <option value="DETECTED">Aşkarlandı</option>
          <option value="ANALYZING">Analiz</option>
          <option value="MITIGATED">Həll Edildi</option>
          <option value="FALSE_POSITIVE">Yalan Pozitiv</option>
        </select>
        <select className="input w-auto" value={criticality} onChange={e => setCriticality(e.target.value)}>
          <option value="">Bütün Kritiklik</option>
          <option value="CRITICAL">Kritik</option>
          <option value="HIGH">Yüksək</option>
          <option value="MEDIUM">Orta</option>
          <option value="LOW">Aşağı</option>
        </select>
      </div>

      <div className="card">
        {isLoading ? <p className="text-gray-500 py-8 text-center">Yüklənir...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-cyber-600/30 text-gray-400">
                <th className="text-left py-3 px-2">Aktiv</th><th className="text-left py-3 px-2">CVSS</th><th className="text-left py-3 px-2">EPSS</th>
                <th className="text-left py-3 px-2">Kritiklik</th><th className="text-left py-3 px-2">Confidence</th><th className="text-left py-3 px-2">Status</th>
              </tr></thead>
              <tbody>
                {data?.data?.map((v: any) => (
                  <tr key={v.id} className="border-b border-cyber-600/10 hover:bg-cyber-700/30">
                    <td className="py-3 px-2"><Link to={`/vulnerabilities/${v.id}`} className="text-cyber-300 hover:underline flex items-center gap-2"><Bug size={14} />{v.asset?.name || 'N/A'}</Link></td>
                    <td className="py-3 px-2 font-mono">{v.cvssScore}</td>
                    <td className="py-3 px-2 font-mono text-xs">{(v.epssScore * 100).toFixed(1)}%</td>
                    <td className="py-3 px-2"><span className={`badge badge-${v.criticality.toLowerCase()}`}>{v.criticality}</span></td>
                    <td className="py-3 px-2">{v.confidenceScore}%</td>
                    <td className="py-3 px-2">{v.status}</td>
                  </tr>
                ))}
                {(!data?.data || data.data.length === 0) && <tr><td colSpan={6} className="py-8 text-center text-gray-500">Zəiflik tapılmadı</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
