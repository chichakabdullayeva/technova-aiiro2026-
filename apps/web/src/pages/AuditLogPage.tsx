import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollText } from 'lucide-react';

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', search],
    queryFn: () => fetch(`/api/audit-log?action=${search}`).then(r => r.json()),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3"><ScrollText className="text-cyber-400" /> Audit Jurnalı</h1>
      <div className="mb-4">
        <input className="input max-w-sm" placeholder="Aksiya axtar..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card">
        {isLoading ? <p className="text-gray-500 py-8 text-center">Yüklənir...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-cyber-600/30 text-gray-400">
                <th className="text-left py-3 px-2">Aksiya</th><th className="text-left py-3 px-2">İstifadəçi</th><th className="text-left py-3 px-2">Detay</th><th className="text-left py-3 px-2">Tarix</th>
              </tr></thead>
              <tbody>
                {data?.data?.map((log: any) => (
                  <tr key={log.id} className="border-b border-cyber-600/10 hover:bg-cyber-700/30">
                    <td className="py-3 px-2 font-mono text-xs text-cyber-300">{log.action}</td>
                    <td className="py-3 px-2">{log.user?.email || 'System'}</td>
                    <td className="py-3 px-2 text-xs text-gray-400 max-w-[300px] truncate">{log.details || '-'}</td>
                    <td className="py-3 px-2 text-gray-500 text-xs">{new Date(log.timestamp).toLocaleString('az')}</td>
                  </tr>
                ))}
                {(!data?.data || data.data.length === 0) && <tr><td colSpan={4} className="py-8 text-center text-gray-500">Jurnal boşdur</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
