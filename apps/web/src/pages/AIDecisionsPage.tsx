import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Brain } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIDecisionsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['ai-decisions'],
    queryFn: () => fetch('/api/ai').then(r => r.json()),
  });

  const handleDecision = async (id: string, action: 'approve' | 'reject') => {
    try {
      await fetch(`/api/ai/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      toast.success(action === 'approve' ? 'Qərar təsdiqləndi' : 'Qərar rədd edildi');
      qc.invalidateQueries({ queryKey: ['ai-decisions'] });
    } catch { toast.error('Xəta baş verdi'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3"><Brain className="text-cyber-400" /> AI Qərarları</h1>
      <div className="card">
        {isLoading ? <p className="text-gray-500 py-8 text-center">Yüklənir...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-cyber-600/30 text-gray-400">
                <th className="text-left py-3 px-2">Hədəf</th><th className="text-left py-3 px-2">Risk</th><th className="text-left py-3 px-2">Tövsiyə</th>
                <th className="text-left py-3 px-2">Avtomatik</th><th className="text-left py-3 px-2">Status</th><th className="text-left py-3 px-2">İcra</th>
              </tr></thead>
              <tbody>
                {data?.data?.map((d: any) => (
                  <tr key={d.id} className="border-b border-cyber-600/10 hover:bg-cyber-700/30">
                    <td className="py-3 px-2">{d.vulnerability?.asset?.name || d.id.slice(0, 8)}</td>
                    <td className="py-3 px-2 font-mono">{d.riskScore}</td>
                    <td className="py-3 px-2"><span className={d.recommendedAction === 'auto_isolate' ? 'text-red-400' : 'text-amber-400'}>{d.recommendedAction}</span></td>
                    <td className="py-3 px-2">{d.autoExecute ? '✅' : '❌'}</td>
                    <td className="py-3 px-2">{d.status}</td>
                    <td className="py-3 px-2">
                      {d.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleDecision(d.id, 'approve')} className="btn bg-green-700 hover:bg-green-600 text-xs py-1 px-2">Təsdiq</button>
                          <button onClick={() => handleDecision(d.id, 'reject')} className="btn bg-red-700 hover:bg-red-600 text-xs py-1 px-2">Rədd</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {(!data?.data || data.data.length === 0) && <tr><td colSpan={6} className="py-8 text-center text-gray-500">Qərar yoxdur</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
