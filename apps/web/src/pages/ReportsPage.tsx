import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => fetch('/api/reports').then(r => r.json()),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3"><FileText className="text-cyber-400" /> Hesabatlar</h1>
      <div className="card">
        {isLoading ? <p className="text-gray-500 py-8 text-center">Yüklənir...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-cyber-600/30 text-gray-400">
                <th className="text-left py-3 px-2">İnsident</th><th className="text-left py-3 px-2">Yaradan</th><th className="text-left py-3 px-2">Tarix</th>
              </tr></thead>
              <tbody>
                {data?.data?.map((r: any) => (
                  <tr key={r.id} className="border-b border-cyber-600/10 hover:bg-cyber-700/30">
                    <td className="py-3 px-2"><Link to={`/reports/${r.id}`} className="text-cyber-300 hover:underline">{r.incident?.title || r.id.slice(0, 8)}</Link></td>
                    <td className="py-3 px-2">{r.generatedBy}</td>
                    <td className="py-3 px-2 text-gray-500 text-xs">{new Date(r.createdAt).toLocaleString('az')}</td>
                  </tr>
                ))}
                {(!data?.data || data.data.length === 0) && <tr><td colSpan={3} className="py-8 text-center text-gray-500">Hesabat yoxdur</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
