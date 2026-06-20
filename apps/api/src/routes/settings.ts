import { Router, Response } from 'express';
import { prisma } from '..';
import { AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const settings = await prisma.setting.findMany();
  const result: Record<string, string> = {};
  settings.forEach(s => { result[s.key] = s.value; });
  res.json(result);
});

router.put('/', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  const updates = req.body as Record<string, string>;
  for (const [key, value] of Object.entries(updates)) {
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  res.json({ status: 'ok' });
});

export default router;
