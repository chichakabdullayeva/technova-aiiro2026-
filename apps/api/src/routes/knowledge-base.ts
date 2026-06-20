import { Router, Response } from 'express';
import { prisma } from '..';
import { AuthRequest } from '../middleware/auth';
import { emitEvent } from '../services/socket';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const entries = await prisma.knowledgeBaseEntry.findMany({
    orderBy: { timesReused: 'desc' },
    include: { sourceIncident: { include: { vulnerability: { include: { asset: true } } } } }
  });
  res.json(entries);
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const entry = await prisma.knowledgeBaseEntry.findUnique({
    where: { id: req.params.id },
    include: { sourceIncident: true }
  });
  if (!entry) return res.status(404).json({ detail: 'Entry not found' });
  res.json(entry);
});

export async function checkKnowledgeBase(vulnerability: { assetType: string; cveId?: string; cvssScore: number }): Promise<boolean> {
  const pattern = `${vulnerability.assetType.toLowerCase()}:${(vulnerability.cveId || 'unknown').toLowerCase()}`;
  const entries = await prisma.knowledgeBaseEntry.findMany();
  for (const entry of entries) {
    if (pattern.includes(entry.pattern) || entry.pattern.includes(pattern)) {
      await prisma.knowledgeBaseEntry.update({ where: { id: entry.id }, data: { timesReused: { increment: 1 } } });
      emitEvent('knowledge_base.fast_path_used', { entry: entry as any, pattern: vulnerability.cveId });
      return true;
    }
  }
  return false;
}

export default router;
