import { Router, Response } from 'express';
import { prisma } from '..';
import { AuthRequest } from '../middleware/auth';
import { emitEvent } from '../services/socket';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query;
  const p = parseInt(page as string), l = parseInt(limit as string);
  const [data, total] = await Promise.all([
    prisma.devSecOpsScan.findMany({ skip: (p - 1) * l, take: l, orderBy: { scannedAt: 'desc' } }),
    prisma.devSecOpsScan.count()
  ]);
  res.json({ data, total, page: p, limit: l });
});

router.post('/scan', async (req: AuthRequest, res: Response) => {
  const { repoOrPipeline, iacTool, config } = req.body;
  if (!repoOrPipeline || !iacTool) return res.status(400).json({ detail: 'repoOrPipeline and iacTool required' });

  const mockFindings = [
    { severity: 'CRITICAL', rule: 'S3 bucket ACL public read', file: 's3.tf', line: 24 },
    { severity: 'HIGH', rule: 'SSH port 22 open to 0.0.0.0/0', file: 'security_group.tf', line: 31 },
    { severity: 'MEDIUM', rule: 'Container running as root', file: 'deployment.yaml', line: 15 },
    { severity: 'LOW', rule: 'Unpinned package version', file: 'Dockerfile', line: 5 },
  ];

  const blockedDeploy = Math.random() > 0.5;
  const numFindings = Math.floor(Math.random() * 3) + 1;
  const findings = mockFindings.slice(0, numFindings);

  const scan = await prisma.devSecOpsScan.create({
    data: { repoOrPipeline, iacTool, findings, blockedDeploy }
  });

  emitEvent('devsecops.scan_completed', { scan: scan as any });
  res.json(scan);
});

export default router;
