import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ReportDetailPage() {
  const { id } = useParams();
  const { data: report, isLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: () => fetch(`/api/reports/${id}`).then(r => r.json()),
  });

  if (isLoading) return <p className="text-gray-500">Yüklənir...</p>;
  if (!report || report.detail) return <p className="text-gray-500">{report?.detail || 'Hesabat tapılmadı'}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3"><FileText className="text-cyber-400" /> Hesabat</h1>
      <div className="card mb-4">
        <div className="text-xs text-gray-500 mb-2">
          İnsident: {report.incident?.title || 'N/A'} · Yaradan: {report.generatedBy} · {new Date(report.createdAt).toLocaleString('az')}
        </div>
      </div>
      <div className="card">
        <article className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{report.content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
