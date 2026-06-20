import { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => { setSettings(d); setLoading(false); });
  }, []);

  const handleSave = async () => {
    try {
      await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      toast.success('Parametrlər yadda saxlanıldı');
    } catch { toast.error('Xəta baş verdi'); }
  };

  if (loading) return <p className="text-gray-500">Yüklənir...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3"><Settings className="text-cyber-400" /> Parametrlər</h1>
        <button onClick={handleSave} className="btn btn-primary flex items-center gap-2"><Save size={16} /> Yadda Saxla</button>
      </div>
      <div className="card space-y-4 max-w-2xl">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key}>
            <label className="text-sm text-gray-400 block mb-1">{key}</label>
            <input className="input" value={value} onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))} />
          </div>
        ))}
        {Object.keys(settings).length === 0 && <p className="text-sm text-gray-500">Heç bir parametr tapılmadı</p>}
      </div>
    </div>
  );
}
