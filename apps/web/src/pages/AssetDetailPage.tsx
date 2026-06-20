import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AssetDetailPage() {
  const { id } = useParams();
  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => fetch(`/api/assets/${id}`).then(r => r.json()),
  });

  const handleIsolate = async (isolate: boolean) => {
    try {
      await fetch(`/api/assets/${isolate ? 'isolate' : 'restore'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      toast.success(isolate ? 'Aktiv izolyasiya edildi' : 'Aktiv bərpa edildi');
    } catch { toast.error('Xəta baş verdi'); }
  };

  if (isLoading) return <p className="text-gray-500">Yüklənir...</p>;
  if (!asset || asset.detail) return <p className="text-gray-500 font-mono text-xs">{asset?.detail || 'Aktiv tapılmadı'}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3"><Shield className="text-cyber-400" />{asset.name}</h1>
        <div className="flex gap-2">
          {asset.status !== 'ISOLATED' ? (
            <button onClick={() => handleIsolate(true)} className="btn btn-danger">İzolyasiya et</button>
          ) : (
            <button onClick={() => handleIsolate(false)} className="btn btn-outline">Bərpa et</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card"><h3 className="text-sm text-gray-400 mb-1">Növ</h3><p>{asset.type}</p></div>
        <div className="card"><h3 className="text-sm text-gray-400 mb-1">IP</h3><p className="font-mono">{asset.ipAddress}</p></div>
        <div className="card"><h3 className="text-sm text-gray-400 mb-1">Kritiklik</h3><p><span className={`badge badge-${asset.criticality.toLowerCase()}`}>{asset.criticality}</span></p></div>
        <div className="card"><h3 className="text-sm text-gray-400 mb-1">Status</h3><p><span className={`badge ${asset.status === 'ACTIVE' ? 'badge-active' : 'badge-passive'}`}>{asset.status}</span></p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold mb-3">Zəifliklər ({asset.vulnerabilities?.length || 0})</h2>
          {asset.vulnerabilities?.map((v: any) => (
            <div key={v.id} className="flex items-center justify-between py-2 border-b border-cyber-600/10 last:border-0">
              <span className="text-sm">CVSS {v.cvssScore} - {v.status}</span>
              <span className="badge badge-high">Conf: {v.confidenceScore}%</span>
            </div>
          )) || <p className="text-sm text-gray-500">Zəiflik yoxdur</p>}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Təhdidlər ({asset.assetThreatMatches?.length || 0})</h2>
          {asset.assetThreatMatches?.map((m: any) => (
            <div key={m.id} className="py-2 border-b border-cyber-600/10 last:border-0">
              <p className="text-sm">{m.threatFeedItem?.title}</p>
              <p className="text-xs text-gray-500">{m.threatFeedItem?.source} · {new Date(m.matchedAt).toLocaleString('az')}</p>
            </div>
          )) || <p className="text-sm text-gray-500">Uyğun təhdid yoxdur</p>}
        </div>
      </div>
    </div>
  );
}
