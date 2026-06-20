import { Router, Response } from 'express';
import { prisma } from '..';
import { AuthRequest } from '../middleware/auth';
import { emitEvent } from '../services/socket';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const { source, severity, hasPatch, page = '1', limit = '20' } = req.query;
  const where: any = {};
  if (source) where.source = source;
  if (severity) where.severity = severity;
  if (hasPatch !== undefined) where.hasOfficialPatch = hasPatch === 'true';
  const p = parseInt(page as string), l = parseInt(limit as string);
  const [data, total] = await Promise.all([
    prisma.threatFeedItem.findMany({ where, skip: (p - 1) * l, take: l, orderBy: { publishedAt: 'desc' }, include: { matchedAssets: { include: { asset: true } } } }),
    prisma.threatFeedItem.count({ where })
  ]);
  res.json({ data, total, page: p, limit: l });
});

router.get('/:id/assets', async (req: AuthRequest, res: Response) => {
  const matches = await prisma.assetThreatMatch.findMany({
    where: { threatFeedItemId: req.params.id },
    include: { asset: true }
  });
  res.json(matches.map(m => m.asset));
});

router.post('/fetch', async (req: AuthRequest, res: Response) => {
  const { count = 1 } = req.body;
  const threats = [];
  for (let i = 0; i < count; i++) {
    const cveNum = 2000 + Math.floor(Math.random() * 9000);
    const severities = ['CRITICAL', 'HIGH', 'MEDIUM'];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const threat = await prisma.threatFeedItem.create({
      data: {
        source: 'trend_micro_zdi',
        cveId: `CVE-2026-${cveNum}`,
        title: `ZDI Threat #${cveNum}: ${['Remote Code Execution', 'Privilege Escalation', 'Auth Bypass', 'Buffer Overflow', 'Command Injection'][Math.floor(Math.random() * 5)]}`,
        description: `Mock ZDI-generated threat for demo purposes. Severity: ${severity}.`,
        severity,
        hasOfficialPatch: Math.random() > 0.6,
      }
    });
    threats.push(threat);
    emitEvent('threat.new', { threat: threat as any });
  }
  res.json({ threats, count: threats.length });
});

export default router;
