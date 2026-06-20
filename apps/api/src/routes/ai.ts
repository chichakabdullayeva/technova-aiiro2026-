import { Router, Response } from 'express';
import { prisma } from '..';
import { AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { emitEvent } from '../services/socket';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const { autoExecute, page = '1', limit = '20' } = req.query;
  const where: any = {};
  if (autoExecute !== undefined) where.autoExecute = autoExecute === 'true';
  const p = parseInt(page as string), l = parseInt(limit as string);
  const [data, total] = await Promise.all([
    prisma.aIDecision.findMany({
      where, skip: (p - 1) * l, take: l, orderBy: { decidedAt: 'desc' },
      include: { vulnerability: { include: { asset: true } } }
    }),
    prisma.aIDecision.count({ where })
  ]);
  res.json({ data, total, page: p, limit: l });
});

router.post('/:id/approve', requireRole('ADMIN', 'SOC_ANALYST'), async (req: AuthRequest, res: Response) => {
  const decision = await prisma.aIDecision.update({
    where: { id: req.params.id },
    data: { autoExecute: true, reviewedBy: req.user!.id }
  });
  emitEvent('ai_decision.made', { decision: decision as any, action: 'approved' });
  res.json(decision);
});

router.post('/:id/reject', requireRole('ADMIN', 'SOC_ANALYST'), async (req: AuthRequest, res: Response) => {
  const decision = await prisma.aIDecision.update({
    where: { id: req.params.id },
    data: { autoExecute: false, reviewedBy: req.user!.id, recommendedAction: 'manual_review' }
  });
  res.json(decision);
});

/**
 * Risk Score Formula:
 * riskScore = cvssScore * 0.4 + epssScore * 10 * 0.3 + criticalityWeight * 0.3
 *   where criticalityWeight: LOW=2, MEDIUM=5, HIGH=8, CRITICAL=10
 */
export function calculateRiskScore(cvssScore: number, epssScore: number, criticality: string): number {
  const cw = { LOW: 2, MEDIUM: 5, HIGH: 8, CRITICAL: 10 }[criticality] || 5;
  return Math.min(10, +(cvssScore * 0.4 + epssScore * 10 * 0.3 + cw * 0.3).toFixed(2));
}

/**
 * Confidence Score (0-100):
 * confidence = (cvssScore/10 * 40) + (epssScore * 100 * 30) + (cw/10 * 30)
 */
export function calculateConfidence(cvssScore: number, epssScore: number, criticality: string): number {
  const cw = { LOW: 2, MEDIUM: 5, HIGH: 8, CRITICAL: 10 }[criticality] || 5;
  return Math.min(100, Math.round((cvssScore / 10) * 40 + epssScore * 30 + (cw / 10) * 30));
}

export default router;
