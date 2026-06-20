import { Router, Response } from 'express';
import { prisma } from '..';
import { AuthRequest } from '../middleware/auth';
import { emitEvent } from '../services/socket';
import { Criticality } from '@prisma/client';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query;
  const p = parseInt(page as string), l = parseInt(limit as string);
  const [data, total] = await Promise.all([
    prisma.basSimulation.findMany({ skip: (p - 1) * l, take: l, orderBy: { ranAt: 'desc' }, include: { vulnerability: { include: { asset: true } } } }),
    prisma.basSimulation.count()
  ]);
  res.json({ data, total, page: p, limit: l });
});

router.post('/simulate/:vulnerabilityId', async (req: AuthRequest, res: Response) => {
  const vuln = await prisma.vulnerability.findUnique({ where: { id: req.params.vulnerabilityId } });
  if (!vuln) return res.status(404).json({ detail: 'Vulnerability not found' });

  const scenarios = ['Exploit attempt via network', 'Payload injection test', 'Auth bypass simulation', 'Buffer overflow test', 'Command injection probe'];
  const results: Array<'confirmed_exploitable' | 'not_exploitable' | 'inconclusive'> = ['confirmed_exploitable', 'not_exploitable', 'inconclusive'];
  const result = results[Math.floor(Math.random() * 3)];

  const sim = await prisma.basSimulation.create({
    data: { vulnerabilityId: vuln.id, scenario: scenarios[Math.floor(Math.random() * scenarios.length)], result }
  });

  emitEvent('bas.completed', { simulation: sim as any, vulnerabilityId: vuln.id });
  res.json(sim);
});

export default router;
