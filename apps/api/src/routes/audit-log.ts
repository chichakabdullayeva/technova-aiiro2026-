import { Router, Response } from 'express';
import { prisma } from '..';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const { action, userId, page = '1', limit = '50' } = req.query;
  const where: any = {};
  if (action) where.action = { contains: action as string };
  if (userId) where.userId = userId as string;
  const p = parseInt(page as string), l = parseInt(limit as string);
  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({ where, skip: (p - 1) * l, take: l, orderBy: { timestamp: 'desc' }, include: { user: { select: { email: true, name: true } } } }),
    prisma.auditLog.count({ where })
  ]);
  res.json({ data, total, page: p, limit: l });
});

export default router;
