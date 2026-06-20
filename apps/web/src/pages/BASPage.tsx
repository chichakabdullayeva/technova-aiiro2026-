import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Target, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BASPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['bas'],
    queryFn: () => fetch('/api/bas').then(r => r.json()),
  });

  const handleSimulate = async () => {
    try {
      await fetch('/api/bas/simulate', { method: 'POST' });
      toast.success('BAS simulyasiyası başladıldı');
      qc.invalidateQueries({ queryKey: ['bas'] });
    } catch { toast.error('Xəta baş verdi'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3"><Target className="text-purple-400" /> BAS Simulyasiya</h1>
        <button onClick={handleSimulate} className="btn btn-primary flex items-center gap-2"><Play size={16} /> Simulyasiya Başlat</button>
      </div>
      <div className="card">
        {isLoading ? <p className="text-gray-500 py-8 text-center">Yüklənir...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-cyber-600/30 text-gray-400">
                <th className="text-left py-3 px-2">Zəiflik ID</th><th className="text-left py-3 px-2">Ssenari</th><th className="text-left py-3 px-2">Nəticə</th><th className="text-left py-3 px-2">Tarix</th>
              </tr></thead>
              <tbody>
                {data?.data?.map((b: any) => (
                  <tr key={b.id} className="border-b border-cyber-600/10 hover:bg-cyber-700/30">
                    <td className="py-3 px-2 font-mono text-xs">{b.vulnerabilityId?.slice(0, 8)}</td>
                    <td className="py-3 px-2">{b.scenario}</td>
                    <td className="py-3 px-2"><span className={`badge ${b.result === 'confirmed_exploitable' ? 'badge-critical' : b.result === 'not_exploitable' ? 'badge-active' : ''}`}>{b.result}</span></td>
                    <td className="py-3 px-2 text-gray-500 text-xs">{new Date(b.createdAt).toLocaleString('az')}</td>
                  </tr>
                ))}
                {(!data?.data || data.data.length === 0) && <tr><td colSpan={4} className="py-8 text-center text-gray-500">Simulyasiya yoxdur</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
