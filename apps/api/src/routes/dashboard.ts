import { Router, Response } from 'express';
import { prisma } from '..';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const [totalAssets, activeVulnerabilities, openIncidents, autoDecisions, totalDecisions, criticalAssets] = await Promise.all([
    prisma.asset.count(),
    prisma.vulnerability.count({ where: { status: { in: ['DETECTED', 'ANALYZING'] } } }),
    prisma.incident.count({ where: { status: 'OPEN' } }),
    prisma.aIDecision.count({ where: { autoExecute: true, decidedAt: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.aIDecision.count({ where: { decidedAt: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.asset.findMany({ where: { criticality: 'CRITICAL', status: 'ACTIVE' }, take: 10, orderBy: { lastSeenAt: 'desc' } }),
  ]);

  // Risk trend (last 7 days mock)
  const riskTrend = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10),
    critical: Math.floor(Math.random() * 5) + 1,
    high: Math.floor(Math.random() * 8) + 2,
    medium: Math.floor(Math.random() * 10) + 3,
  }));

  res.json({
    totalAssets,
    activeVulnerabilities,
    openIncidents,
    autoResolvedPercent: totalDecisions > 0 ? Math.round((autoDecisions / totalDecisions) * 100) : 0,
    riskTrend,
    topCriticalAssets: criticalAssets.map(a => ({ id: a.id, name: a.name, type: a.type, status: a.status })),
  });
});

export default router;
