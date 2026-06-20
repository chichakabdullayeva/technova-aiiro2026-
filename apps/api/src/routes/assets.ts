import { Router, Response } from 'express';
import { prisma } from '..';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const { type, criticality, status, search, page = '1', limit = '20' } = req.query;
  const where: any = {};
  if (type) where.type = type;
  if (criticality) where.criticality = criticality;
  if (status) where.status = status;
  if (search) where.OR = [
    { name: { contains: search as string, mode: 'insensitive' } },
    { ipAddress: { contains: search as string } }
  ];
  const p = parseInt(page as string), l = parseInt(limit as string);
  const [data, total] = await Promise.all([
    prisma.asset.findMany({ where, skip: (p - 1) * l, take: l, orderBy: { createdAt: 'desc' } }),
    prisma.asset.count({ where })
  ]);
  res.json({ data, total, page: p, limit: l });
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const asset = await prisma.asset.findUnique({
    where: { id: req.params.id },
    include: { vulnerabilities: { include: { threatFeedItem: true, aiDecisions: true, remediations: true } } }
  });
  if (!asset) return res.status(404).json({ detail: 'Asset not found' });
  res.json(asset);
});

router.post('/sync', async (req: AuthRequest, res: Response) => {
  const { assets: incomingAssets } = req.body;
  if (!Array.isArray(incomingAssets)) return res.status(400).json({ detail: 'assets array required' });
  const results = [];
  for (const a of incomingAssets) {
    const existing = a.ipAddress
      ? await prisma.asset.findFirst({ where: { ipAddress: a.ipAddress } })
      : null;
    if (existing) {
      const updated = await prisma.asset.update({ where: { id: existing.id }, data: { lastSeenAt: new Date(), status: 'ACTIVE' } });
      results.push(updated);
    } else {
      const created = await prisma.asset.create({ data: { name: a.name || a.ipAddress, type: a.type || 'UNKNOWN', ipAddress: a.ipAddress, criticality: a.criticality || 'MEDIUM', tags: a.tags || [] } });
      results.push(created);
    }
  }
  res.json({ synced: results.length, assets: results });
});

router.post('/:id/isolate', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SOC_ANALYST') {
    return res.status(403).json({ detail: 'Forbidden' });
  }
  const asset = await prisma.asset.update({ where: { id: req.params.id }, data: { status: 'ISOLATED' } });
  await prisma.auditLog.create({ data: { userId: req.user!.id, action: 'asset.isolated', entityType: 'Asset', entityId: asset.id, details: { name: asset.name } } });
  res.json(asset);
});

router.post('/:id/restore', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SOC_ANALYST') {
    return res.status(403).json({ detail: 'Forbidden' });
  }
  const asset = await prisma.asset.update({ where: { id: req.params.id }, data: { status: 'ACTIVE' } });
  await prisma.auditLog.create({ data: { userId: req.user!.id, action: 'asset.restored', entityType: 'Asset', entityId: asset.id, details: { name: asset.name } } });
  res.json(asset);
});

export default router;
