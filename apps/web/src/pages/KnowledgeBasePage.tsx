import { useQuery } from '@tanstack/react-query';
import { BookOpen, Zap } from 'lucide-react';

export default function KnowledgeBasePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['knowledge-base'],
    queryFn: () => fetch('/api/knowledge-base').then(r => r.json()),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3"><BookOpen className="text-emerald-400" /> Bilik Bazası</h1>
      <div className="space-y-3">
        {isLoading ? <p className="text-gray-500 py-8 text-center">Yüklənir...</p> : (
          data?.map((e: any) => (
            <div key={e.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium">{e.title}</h3>
                <div className="flex items-center gap-1 text-xs text-cyber-400"><Zap size={12} /> {e.timesReused} dəfə istifadə</div>
              </div>
              <p className="text-sm text-gray-400 mb-2">{e.content?.slice(0, 200)}...</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="badge badge-medium">{e.pattern}</span>
                {e.sourceIncident && <span>Mənbə: {e.sourceIncident.title}</span>}
              </div>
            </div>
          ))
        )}
        {!isLoading && (!data || data.length === 0) && <p className="text-gray-500 text-center py-8">Bilik bazası boşdur</p>}
      </div>
    </div>
  );
}
