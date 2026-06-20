import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Code, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DevSecOpsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['devsecops'],
    queryFn: () => fetch('/api/devsecops').then(r => r.json()),
  });

  const handleScan = async () => {
    try {
      await fetch('/api/devsecops/scan', { method: 'POST' });
      toast.success('DevSecOps skanı başladıldı');
      qc.invalidateQueries({ queryKey: ['devsecops'] });
    } catch { toast.error('Xəta baş verdi'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3"><Code className="text-cyan-400" /> DevSecOps</h1>
        <button onClick={handleScan} className="btn btn-primary flex items-center gap-2"><Play size={16} /> Skan Başlat</button>
      </div>
      <div className="card">
        {isLoading ? <p className="text-gray-500 py-8 text-center">Yüklənir...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-cyber-600/30 text-gray-400">
                <th className="text-left py-3 px-2">Aktiv</th><th className="text-left py-3 px-2">Skan Növü</th><th className="text-left py-3 px-2">Nəticə</th>
                <th className="text-left py-3 px-2">Tapıntılar</th><th className="text-left py-3 px-2">Tarix</th>
              </tr></thead>
              <tbody>
                {data?.data?.map((s: any) => (
                  <tr key={s.id} className="border-b border-cyber-600/10 hover:bg-cyber-700/30">
                    <td className="py-3 px-2">{s.asset?.name || 'N/A'}</td>
                    <td className="py-3 px-2">{s.scanType}</td>
                    <td className="py-3 px-2"><span className={`badge ${s.result === 'compliant' ? 'badge-active' : 'badge-critical'}`}>{s.result}</span></td>
                    <td className="py-3 px-2 text-xs">{s.findings || '-'}</td>
                    <td className="py-3 px-2 text-gray-500 text-xs">{new Date(s.completedAt || s.createdAt).toLocaleString('az')}</td>
                  </tr>
                ))}
                {(!data?.data || data.data.length === 0) && <tr><td colSpan={5} className="py-8 text-center text-gray-500">Skan yoxdur</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
