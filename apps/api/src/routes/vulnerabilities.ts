import { Router, Response } from 'express';
import { prisma } from '..';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const { status, criticality, page = '1', limit = '20' } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (criticality) where.criticality = criticality;
  const p = parseInt(page as string), l = parseInt(limit as string);
  const [data, total] = await Promise.all([
    prisma.vulnerability.findMany({
      where, skip: (p - 1) * l, take: l, orderBy: { detectedAt: 'desc' },
      include: { asset: true, threatFeedItem: true, aiDecisions: true, remediations: true, basSimulations: true }
    }),
    prisma.vulnerability.count({ where })
  ]);
  res.json({ data, total, page: p, limit: l });
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const vuln = await prisma.vulnerability.findUnique({
    where: { id: req.params.id },
    include: { asset: true, threatFeedItem: true, aiDecisions: true, remediations: { include: { wafIpsRules: true } }, basSimulations: true, incidents: true }
  });
  if (!vuln) return res.status(404).json({ detail: 'Vulnerability not found' });
  res.json(vuln);
});

export default router;
