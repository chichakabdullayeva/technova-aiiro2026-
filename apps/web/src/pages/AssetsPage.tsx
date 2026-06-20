import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Shield, Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AssetsPage() {
  const [search, setSearch] = useState('');
  const [criticality, setCriticality] = useState('');
  const [status, setStatus] = useState('');
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['assets', search, criticality, status],
    queryFn: () => fetch(`/api/assets?search=${search}&criticality=${criticality}&status=${status}`).then(r => r.json()),
  });

  const handleSync = async () => {
    try {
      await fetch('/api/assets/sync', { method: 'POST' });
      toast.success('Aktiv sinxronizasiyası başladıldı');
      refetch();
    } catch { toast.error('Sinxronizasiya xətası'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Aktivlər</h1>
        <button onClick={handleSync} className="btn btn-primary flex items-center gap-2"><Plus size={16} /> Sinxronizasiya</button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
          <input className="input pl-9" placeholder="Aktiv axtar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={criticality} onChange={e => setCriticality(e.target.value)}>
          <option value="">Bütün Kritiklik</option>
          <option value="CRITICAL">Kritik</option>
          <option value="HIGH">Yüksək</option>
          <option value="MEDIUM">Orta</option>
          <option value="LOW">Aşağı</option>
        </select>
        <select className="input w-auto" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Bütün Status</option>
          <option value="ACTIVE">Aktiv</option>
          <option value="ISOLATED">İzolyasiya</option>
          <option value="MAINTENANCE">Baxım</option>
          <option value="RETIRED">İstifadə Xaric</option>
        </select>
      </div>

      <div className="card">
        {isLoading ? (
          <p className="text-gray-500 py-8 text-center">Yüklənir...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-cyber-600/30 text-gray-400">
                <th className="text-left py-3 px-2">Ad</th><th className="text-left py-3 px-2">Növ</th><th className="text-left py-3 px-2">IP</th>
                <th className="text-left py-3 px-2">Kritiklik</th><th className="text-left py-3 px-2">Status</th><th className="text-left py-3 px-2">Son Görünmə</th>
              </tr></thead>
              <tbody>
                {data?.data?.map((a: any) => (
                  <tr key={a.id} className="border-b border-cyber-600/10 hover:bg-cyber-700/30">
                    <td className="py-3 px-2"><Link to={`/assets/${a.id}`} className="text-cyber-300 hover:underline flex items-center gap-2"><Shield size={14} />{a.name}</Link></td>
                    <td className="py-3 px-2">{a.type}</td><td className="py-3 px-2 font-mono text-xs">{a.ipAddress}</td>
                    <td className="py-3 px-2"><span className={`badge badge-${a.criticality.toLowerCase()}`}>{a.criticality}</span></td>
                    <td className="py-3 px-2"><span className={`badge ${a.status === 'ACTIVE' ? 'badge-active' : 'badge-passive'}`}>{a.status}</span></td>
                    <td className="py-3 px-2 text-gray-500">{new Date(a.lastSeenAt).toLocaleString('az')}</td>
                  </tr>
                ))}
                {(!data?.data || data.data.length === 0) && <tr><td colSpan={6} className="py-8 text-center text-gray-500">Aktiv tapılmadı</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
