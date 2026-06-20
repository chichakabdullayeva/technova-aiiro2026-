import { Router, Response } from 'express';
import { prisma } from '..';
import { AuthRequest } from '../middleware/auth';
import { emitEvent } from '../services/socket';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query;
  const where: any = {};
  if (status) where.status = status;
  const p = parseInt(page as string), l = parseInt(limit as string);
  const [data, total] = await Promise.all([
    prisma.incident.findMany({ where, skip: (p - 1) * l, take: l, orderBy: { createdAt: 'desc' }, include: { vulnerability: { include: { asset: true } }, reports: true } }),
    prisma.incident.count({ where })
  ]);
  res.json({ data, total, page: p, limit: l });
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const incident = await prisma.incident.findUnique({
    where: { id: req.params.id },
    include: { vulnerability: { include: { asset: true, threatFeedItem: true, aiDecisions: true, remediations: true } }, reports: true, knowledgeBaseEntries: true }
  });
  if (!incident) return res.status(404).json({ detail: 'Incident not found' });
  res.json(incident);
});

export default router;
