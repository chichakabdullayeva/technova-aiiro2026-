import { PrismaClient, VulnerabilityStatus, RemediationType, RemediationStatus, Criticality } from '@prisma/client';
import { Queue, Worker } from 'bullmq';

const prisma = new PrismaClient();
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const microScanQueue = new Queue('micro-scan', { connection: { url: REDIS_URL } });
const basQueue = new Queue('bas-simulation', { connection: { url: REDIS_URL } });
const reportQueue = new Queue('report-generation', { connection: { url: REDIS_URL } });

// Micro-scan worker: simulates scanning an asset for vulnerabilities
new Worker('micro-scan', async job => {
  const { threatId, assetId } = job.data;
  console.log(`[Worker] Micro-scanning asset ${assetId} for threat ${threatId}`);

  // Simulate scan delay
  await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));

  const vulnerabilityFound = Math.random() > 0.3;
  if (vulnerabilityFound) {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    const threat = await prisma.threatFeedItem.findUnique({ where: { id: threatId } });
    if (!asset || !threat) return;

    const cvssScore = +(5 + Math.random() * 5).toFixed(1);
    const epssScore = +(Math.random() * 0.9).toFixed(4);
    const cw = { LOW: 2, MEDIUM: 5, HIGH: 8, CRITICAL: 10 }[asset.criticality] || 5;
    const confidence = Math.min(100, Math.round((cvssScore / 10) * 40 + epssScore * 30 + (cw / 10) * 30));

    const vulnerability = await prisma.vulnerability.create({
      data: { assetId, threatFeedItemId: threatId, cvssScore, epssScore, criticality: asset.criticality, confidenceScore: confidence, status: VulnerabilityStatus.DETECTED }
    });

    console.log(`[Worker] Vulnerability ${vulnerability.id} created (CVSS: ${cvssScore}, Confidence: ${confidence}%)`);
  }
}, { connection: { url: REDIS_URL } });

// BAS simulation worker
new Worker('bas-simulation', async job => {
  const { vulnerabilityId } = job.data;
  console.log(`[Worker] BAS simulating vulnerability ${vulnerabilityId}`);

  await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));

  const results = ['confirmed_exploitable', 'not_exploitable', 'inconclusive'];
  const result = results[Math.floor(Math.random() * results.length)];

  await prisma.basSimulation.create({
    data: { vulnerabilityId, scenario: 'Automated BAS simulation', result }
  });

  console.log(`[Worker] BAS result for ${vulnerabilityId}: ${result}`);
}, { connection: { url: REDIS_URL } });

// Report generation worker
new Worker('report-generation', async job => {
  const { incidentId } = job.data;
  console.log(`[Worker] Generating report for incident ${incidentId}`);

  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: { vulnerability: { include: { asset: true, threatFeedItem: true, aiDecisions: true, remediations: true } } }
  });
  if (!incident) return;

  const v = incident.vulnerability;
  const report = `## Incident Report: ${incident.title}\n\n`
    + `### What Happened\n`
    + `${v.threatFeedItem?.title || 'Unknown threat'} detected on ${v.asset?.name || 'unknown asset'}. `
    + `CVSS Score: ${v.cvssScore}, EPSS: ${(v.epssScore * 100).toFixed(1)}%.\n\n`
    + `### How Detected\n`
    + `ZDI Threat Feed → Asset matching → Micro-scan confirmed vulnerability.\n`
    + `AI Decision Maker calculated risk with ${v.confidenceScore}% confidence.\n\n`
    + `### Response\n`
    + `SOAR module ${v.remediations.length > 0 ? 'applied ' + v.remediations.length + ' remediation actions' : 'pending response'}.\n\n`
    + `### Status\n`
    + `⚠️ ${incident.status === 'RESOLVED' ? 'Resolved' : incident.status === 'CONTAINED' ? 'Contained' : 'Open - investigation ongoing'}.\n`;

  await prisma.incidentReport.create({
    data: { incidentId, generatedBy: 'llm', content: report }
  });

  console.log(`[Worker] Report generated for incident ${incidentId}`);
}, { connection: { url: REDIS_URL } });

console.log('🧬 Kiber-DNT Worker started');
console.log('   Queues: micro-scan, bas-simulation, report-generation');
