import { Router, Response } from 'express';
import { prisma } from '..';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query;
  const p = parseInt(page as string), l = parseInt(limit as string);
  const [data, total] = await Promise.all([
    prisma.incidentReport.findMany({ skip: (p - 1) * l, take: l, orderBy: { createdAt: 'desc' }, include: { incident: { include: { vulnerability: { include: { asset: true } } } } } }),
    prisma.incidentReport.count()
  ]);
  res.json({ data, total, page: p, limit: l });
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const report = await prisma.incidentReport.findUnique({
    where: { id: req.params.id },
    include: { incident: { include: { vulnerability: { include: { asset: true, threatFeedItem: true, aiDecisions: true, remediations: true } } } } }
  });
  if (!report) return res.status(404).json({ detail: 'Report not found' });
  res.json(report);
});

export default router;
