import { useQuery } from '@tanstack/react-query';
import { Globe, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ThreatFeedPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['threats'],
    queryFn: () => fetch('/api/threats').then(r => r.json()),
  });

  const handleFetch = async () => {
    try {
      await fetch('/api/threats/fetch', { method: 'POST' });
      toast.success('Təhdid məlumatları yenilənir');
      refetch();
    } catch { toast.error('Xəta baş verdi'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Təhdid Kəşfiyyatı</h1>
        <button onClick={handleFetch} className="btn btn-primary flex items-center gap-2"><Download size={16} /> Təhdid Çək</button>
      </div>

      <div className="card">
        {isLoading ? <p className="text-gray-500 py-8 text-center">Yüklənir...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-cyber-600/30 text-gray-400">
                <th className="text-left py-3 px-2">Başlıq</th><th className="text-left py-3 px-2">Mənbə</th><th className="text-left py-3 px-2">CVE</th>
                <th className="text-left py-3 px-2">CVSS</th><th className="text-left py-3 px-2">Status</th><th className="text-left py-3 px-2">Tarix</th>
              </tr></thead>
              <tbody>
                {data?.data?.map((t: any) => (
                  <tr key={t.id} className="border-b border-cyber-600/10 hover:bg-cyber-700/30">
                    <td className="py-3 px-2"><span className="flex items-center gap-2"><Globe size={14} className="text-cyber-400" />{t.title}</span></td>
                    <td className="py-3 px-2">{t.source}</td>
                    <td className="py-3 px-2 font-mono text-xs text-cyber-300">{t.cveId || '-'}</td>
                    <td className="py-3 px-2">{t.cvssScore}</td>
                    <td className="py-3 px-2">{t.status}</td>
                    <td className="py-3 px-2 text-gray-500">{new Date(t.publishedAt).toLocaleDateString('az')}</td>
                  </tr>
                ))}
                {(!data?.data || data.data.length === 0) && <tr><td colSpan={6} className="py-8 text-center text-gray-500">Təhdid yoxdur</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
