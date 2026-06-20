import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RemediationPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['remediation'],
    queryFn: () => fetch('/api/remediation').then(r => r.json()),
  });

  const handleRollback = async (id: string) => {
    try {
      await fetch('/api/remediation/rollback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      toast.success('Geri qaytarma uğurlu');
      qc.invalidateQueries({ queryKey: ['remediation'] });
    } catch { toast.error('Xəta baş verdi'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3"><Activity className="text-green-400" /> SOAR Remediasiya</h1>
      <div className="card">
        {isLoading ? <p className="text-gray-500 py-8 text-center">Yüklənir...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-cyber-600/30 text-gray-400">
                <th className="text-left py-3 px-2">Aktiv</th><th className="text-left py-3 px-2">Növ</th><th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Detay</th><th className="text-left py-3 px-2">Tarix</th><th className="text-left py-3 px-2">İcra</th>
              </tr></thead>
              <tbody>
                {data?.data?.map((r: any) => (
                  <tr key={r.id} className="border-b border-cyber-600/10 hover:bg-cyber-700/30">
                    <td className="py-3 px-2">{r.vulnerability?.asset?.name || 'N/A'}</td>
                    <td className="py-3 px-2">{r.actionType}</td>
                    <td className="py-3 px-2"><span className={`badge ${r.status === 'COMPLETED' ? 'badge-active' : r.status === 'FAILED' ? 'badge-critical' : ''}`}>{r.status}</span></td>
                    <td className="py-3 px-2 text-xs text-gray-400 max-w-[200px] truncate">{r.details}</td>
                    <td className="py-3 px-2 text-gray-500 text-xs">{new Date(r.createdAt).toLocaleString('az')}</td>
                    <td className="py-3 px-2">
                      {r.status !== 'ROLLED_BACK' && (
                        <button onClick={() => handleRollback(r.id)} className="btn btn-outline text-xs py-1 px-2 flex items-center gap-1"><RotateCcw size={12} /> Geri</button>
                      )}
                    </td>
                  </tr>
                ))}
                {(!data?.data || data.data.length === 0) && <tr><td colSpan={6} className="py-8 text-center text-gray-500">Remediasiya yoxdur</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
