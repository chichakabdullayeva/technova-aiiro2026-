import { Router, Response } from 'express';
import { prisma } from '..';
import { AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { emitEvent } from '../services/socket';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const { status, type, page = '1', limit = '20' } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = type;
  const p = parseInt(page as string), l = parseInt(limit as string);
  const [data, total] = await Promise.all([
    prisma.remediationAction.findMany({
      where, skip: (p - 1) * l, take: l, orderBy: { createdAt: 'desc' },
      include: { vulnerability: { include: { asset: true } }, wafIpsRules: true }
    }),
    prisma.remediationAction.count({ where })
  ]);
  res.json({ data, total, page: p, limit: l });
});

router.post('/:id/rollback', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  const rem = await prisma.remediationAction.update({
    where: { id: req.params.id },
    data: { status: 'ROLLED_BACK', rolledBackAt: new Date() }
  });
  await prisma.wafIpsRule.updateMany({ where: { remediationActionId: rem.id }, data: { active: false } });
  if (rem.assetId) {
    await prisma.asset.update({ where: { id: rem.assetId }, data: { status: 'ACTIVE' } });
  }
  emitEvent('remediation.applied', { remediation: rem as any, action: 'rolled_back' });
  res.json(rem);
});

/**
 * Generate WAF/IPS rule based on vulnerability type
 */
export function generateWafRule(vulnerability: { cvssScore: number; type?: string; cveId?: string }): { snort: string; modsec: string } {
  const sid = 100000 + Math.floor(Math.random() * 900000);
  const snortRule = `alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:"CVE-${vulnerability.cveId || 'unknown'} - exploit attempt"; classtype:attempted-admin; sid:${sid}; rev:1;)`;
  const modsecRule = `SecRule REQUEST_HEADERS:User-Agent "@contains exploit" "id:${sid + 1},phase:1,deny,status:403,msg:'CVE-${vulnerability.cveId || 'unknown'} blocked',severity:'CRITICAL'"`;
  return { snort: snortRule, modsec: modsecRule };
}

export default router;
