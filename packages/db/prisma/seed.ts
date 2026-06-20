import { PrismaClient, Role, AssetType, Criticality, AssetStatus, ScanJobType, ScanJobStatus, ScanTrigger, VulnerabilityStatus, RemediationType, RemediationStatus, IncidentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.knowledgeBaseEntry.deleteMany();
  await prisma.incidentReport.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.devSecOpsScan.deleteMany();
  await prisma.basSimulation.deleteMany();
  await prisma.wafIpsRule.deleteMany();
  await prisma.remediationAction.deleteMany();
  await prisma.aIDecision.deleteMany();
  await prisma.scanJob.deleteMany();
  await prisma.vulnerability.deleteMany();
  await prisma.assetThreatMatch.deleteMany();
  await prisma.threatFeedItem.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  // Users (password: "admin" for all)
  const pwHash = bcrypt.hashSync('admin', 10);
  const admin = await prisma.user.create({
    data: { email: 'admin@kiberdnt.az', passwordHash: pwHash, name: 'Admin', role: Role.ADMIN },
  });
  await prisma.user.create({
    data: { email: 'analyst@kiberdnt.az', passwordHash: pwHash, name: 'SOC Analyst', role: Role.SOC_ANALYST },
  });
  await prisma.user.create({
    data: { email: 'viewer@kiberdnt.az', passwordHash: pwHash, name: 'Viewer', role: Role.VIEWER },
  });

  // Assets (20+)
  const assetData = [
    { name: 'Smart Traffic Camera K-12', type: AssetType.CAMERA, ipAddress: '10.0.1.12', criticality: Criticality.HIGH, tags: ['cctv', 'traffic', 'zone-a'] },
    { name: 'Water Treatment PLC-01', type: AssetType.WATER_SYSTEM, ipAddress: '10.0.2.5', criticality: Criticality.CRITICAL, tags: ['scada', 'water', 'plc'] },
    { name: 'AWS S3 Bucket: logs-prod', type: AssetType.CLOUD_OBJECT, ipAddress: 's3://logs-prod', criticality: Criticality.HIGH, tags: ['cloud', 'aws', 's3'] },
    { name: 'Main Web Server - Nginx', type: AssetType.SERVER, ipAddress: '10.0.10.1', criticality: Criticality.CRITICAL, tags: ['web', 'nginx', 'frontend'] },
    { name: 'Temp Sensor Array B-7', type: AssetType.IOT_SENSOR, ipAddress: '10.0.3.15', criticality: Criticality.LOW, tags: ['iot', 'sensor', 'temperature'] },
    { name: 'Smart Grid Meter M-204', type: AssetType.IOT_SENSOR, ipAddress: '10.0.4.8', criticality: Criticality.HIGH, tags: ['grid', 'smart-meter', 'energy'] },
    { name: 'Core Database Server', type: AssetType.SERVER, ipAddress: '10.0.10.5', criticality: Criticality.CRITICAL, tags: ['database', 'postgres', 'core'] },
    { name: 'Building Access Controller', type: AssetType.NETWORK_DEVICE, ipAddress: '10.0.5.20', criticality: Criticality.HIGH, tags: ['access', 'security', 'building'] },
    { name: 'API Gateway - Kong', type: AssetType.SERVER, ipAddress: '10.0.10.10', criticality: Criticality.CRITICAL, tags: ['api', 'gateway', 'kong'] },
    { name: 'Edge Router R-01', type: AssetType.NETWORK_DEVICE, ipAddress: '192.168.1.1', criticality: Criticality.HIGH, tags: ['network', 'router', 'edge'] },
    { name: 'HVAC Controller - Floor 3', type: AssetType.IOT_SENSOR, ipAddress: '10.0.6.3', criticality: Criticality.MEDIUM, tags: ['hvac', 'building', 'iot'] },
    { name: 'Air Quality Monitor AQ-7', type: AssetType.IOT_SENSOR, ipAddress: '10.0.3.22', criticality: Criticality.LOW, tags: ['iot', 'air', 'environment'] },
    { name: 'Backup Storage Array', type: AssetType.SERVER, ipAddress: '10.0.10.50', criticality: Criticality.MEDIUM, tags: ['storage', 'backup', 'nas'] },
    { name: 'SCADA Master Station', type: AssetType.SERVER, ipAddress: '10.0.2.1', criticality: Criticality.CRITICAL, tags: ['scada', 'master', 'water'] },
    { name: '5G Small Cell - Tower 4', type: AssetType.NETWORK_DEVICE, ipAddress: '10.0.7.4', criticality: Criticality.MEDIUM, tags: ['5g', 'cell', 'tower'] },
    { name: 'Parking Sensor Network', type: AssetType.IOT_SENSOR, ipAddress: '10.0.8.0/24', criticality: Criticality.LOW, tags: ['iot', 'parking', 'sensors'] },
    { name: 'Fire Alarm Panel F-12', type: AssetType.IOT_SENSOR, ipAddress: '10.0.9.12', criticality: Criticality.HIGH, tags: ['fire', 'safety', 'alarm'] },
    { name: 'Kubernetes Cluster - Prod', type: AssetType.CLOUD_OBJECT, ipAddress: '10.0.11.0/24', criticality: Criticality.CRITICAL, tags: ['k8s', 'kubernetes', 'orchestration'] },
    { name: 'DNS Server - Primary', type: AssetType.SERVER, ipAddress: '10.0.10.53', criticality: Criticality.HIGH, tags: ['dns', 'network', 'infra'] },
    { name: 'Mail Server - Exchange', type: AssetType.SERVER, ipAddress: '10.0.10.25', criticality: Criticality.MEDIUM, tags: ['mail', 'exchange', 'communication'] },
    { name: 'Load Balancer - HAProxy', type: AssetType.NETWORK_DEVICE, ipAddress: '10.0.10.100', criticality: Criticality.HIGH, tags: ['lb', 'haproxy', 'traffic'] },
    { name: 'Smart Street Light Controller', type: AssetType.IOT_SENSOR, ipAddress: '10.0.12.1', criticality: Criticality.LOW, tags: ['iot', 'lighting', 'street'] },
  ];

  const assets = await Promise.all(
    assetData.map(a => prisma.asset.create({ data: a }))
  );

  // Threat Feed Items (10)
  const threats = await Promise.all([
    prisma.threatFeedItem.create({ data: { source: 'trend_micro_zdi', cveId: 'CVE-2025-1001', title: 'Smart Camera RTSP Buffer Overflow', description: 'Buffer overflow in RTSP stream handler allows remote code execution on IP cameras.', severity: 'CRITICAL', hasOfficialPatch: false } }),
    prisma.threatFeedItem.create({ data: { source: 'trend_micro_zdi', cveId: 'CVE-2025-1002', title: 'SCADA Modbus Authentication Bypass', description: 'Authentication bypass in Modbus TCP gateway used in water treatment plants.', severity: 'CRITICAL', hasOfficialPatch: false } }),
    prisma.threatFeedItem.create({ data: { source: 'trend_micro_zdi', cveId: 'CVE-2025-1003', title: 'PLC DNP3 Remote Shutdown', description: 'Crafted DNP3 packet causes PLC to enter halt state.', severity: 'HIGH', hasOfficialPatch: true } }),
    prisma.threatFeedItem.create({ data: { source: 'trend_micro_zdi', cveId: 'CVE-2025-1004', title: 'Smart Meter MQTT Tampering', description: 'Unencrypted MQTT subscription allows malicious power consumption reporting.', severity: 'HIGH', hasOfficialPatch: false } }),
    prisma.threatFeedItem.create({ data: { source: 'trend_micro_zdi', cveId: 'CVE-2025-1005', title: 'Traffic Light OS Command Injection', description: 'OS command injection in traffic controller web interface.', severity: 'CRITICAL', hasOfficialPatch: false } }),
    prisma.threatFeedItem.create({ data: { source: 'trend_micro_zdi', cveId: 'CVE-2025-1006', title: 'IoT Infusion Pump BLE Hijack', description: 'Default credentials and unpatched BLE stack allow remote dose manipulation.', severity: 'CRITICAL', hasOfficialPatch: false } }),
    prisma.threatFeedItem.create({ data: { source: 'trend_micro_zdi', cveId: 'CVE-2025-1007', title: 'BACnet HVAC RCE', description: 'Unrestricted BACnet WriteProperty allows arbitrary HVAC control.', severity: 'HIGH', hasOfficialPatch: true } }),
    prisma.threatFeedItem.create({ data: { source: 'trend_micro_zdi', cveId: 'CVE-2025-1008', title: '5G Small Cell PrivEsc', description: 'Hardcoded root credentials in 5G femtocell management.', severity: 'HIGH', hasOfficialPatch: false } }),
    prisma.threatFeedItem.create({ data: { source: 'manual', cveId: 'CVE-2025-1009', title: 'K8s API Server RBAC Bypass', description: 'RBAC configuration allows privilege escalation via API server.', severity: 'CRITICAL', hasOfficialPatch: false } }),
    prisma.threatFeedItem.create({ data: { source: 'trend_micro_zdi', cveId: 'CVE-2025-1010', title: 'Edge Router VPN Buffer Overflow', description: 'Buffer overflow in VPN module allows remote code execution on edge routers.', severity: 'HIGH', hasOfficialPatch: false } }),
  ]);

  // Asset-Threat Matches
  const matches = [
    [assets[0].id, threats[0].id, 92],
    [assets[1].id, threats[1].id, 95],
    [assets[3].id, threats[2].id, 78],
    [assets[5].id, threats[3].id, 88],
    [assets[12].id, threats[2].id, 65],
    [assets[15].id, threats[9].id, 45],
  ];
  await Promise.all(
    matches.map(([aId, tId, score]) =>
      prisma.assetThreatMatch.create({ data: { assetId: aId, threatFeedItemId: tId, matchScore: score } })
    )
  );

  // Vulnerabilities
  const vulns = await Promise.all([
    prisma.vulnerability.create({ data: { assetId: assets[0].id, threatFeedItemId: threats[0].id, cvssScore: 9.8, epssScore: 0.85, criticality: Criticality.CRITICAL, confidenceScore: 95, status: VulnerabilityStatus.MITIGATED, mitigatedAt: new Date() } }),
    prisma.vulnerability.create({ data: { assetId: assets[1].id, threatFeedItemId: threats[1].id, cvssScore: 9.1, epssScore: 0.72, criticality: Criticality.CRITICAL, confidenceScore: 92, status: VulnerabilityStatus.MITIGATED, mitigatedAt: new Date() } }),
    prisma.vulnerability.create({ data: { assetId: assets[3].id, threatFeedItemId: threats[2].id, cvssScore: 7.5, epssScore: 0.45, criticality: Criticality.HIGH, confidenceScore: 82, status: VulnerabilityStatus.ANALYZING } }),
    prisma.vulnerability.create({ data: { assetId: assets[5].id, threatFeedItemId: threats[3].id, cvssScore: 8.2, epssScore: 0.62, criticality: Criticality.HIGH, confidenceScore: 88, status: VulnerabilityStatus.DETECTED } }),
    prisma.vulnerability.create({ data: { assetId: assets[3].id, threatFeedItemId: threats[8].id, cvssScore: 9.3, epssScore: 0.91, criticality: Criticality.HIGH, confidenceScore: 72, status: VulnerabilityStatus.DETECTED } }),
    prisma.vulnerability.create({ data: { assetId: assets[10].id, threatFeedItemId: threats[6].id, cvssScore: 6.8, epssScore: 0.35, criticality: Criticality.MEDIUM, confidenceScore: 68, status: VulnerabilityStatus.DETECTED } }),
  ]);

  // AI Decisions
  await Promise.all([
    prisma.aIDecision.create({ data: { vulnerabilityId: vulns[0].id, riskScore: 9.2, confidenceScore: 95, recommendedAction: 'auto_isolate', reasoning: 'Critical vulnerability on camera asset with CVSS 9.8 and EPSS 0.85. High confidence auto-isolation triggered.', autoExecute: true } }),
    prisma.aIDecision.create({ data: { vulnerabilityId: vulns[1].id, riskScore: 8.8, confidenceScore: 92, recommendedAction: 'virtual_patch', reasoning: 'SCADA authentication bypass critical for water system. Generating WAF rule to block exploit attempts.', autoExecute: true } }),
    prisma.aIDecision.create({ data: { vulnerabilityId: vulns[2].id, riskScore: 6.5, confidenceScore: 82, recommendedAction: 'manual_review', reasoning: 'Medium confidence score requires analyst review before action.', autoExecute: false } }),
    prisma.aIDecision.create({ data: { vulnerabilityId: vulns[3].id, riskScore: 7.2, confidenceScore: 88, recommendedAction: 'virtual_patch', reasoning: 'High severity MQTT tampering threat on smart meter. Recommend virtual patch.', autoExecute: false } }),
  ]);

  // Remediation Actions
  const rems = await Promise.all([
    prisma.remediationAction.create({ data: { vulnerabilityId: vulns[0].id, assetId: assets[0].id, type: RemediationType.ISOLATION, targetSystem: 'firewall', ruleGenerated: 'block ip 10.0.1.12 any any', status: RemediationStatus.APPLIED, appliedAt: new Date() } }),
    prisma.remediationAction.create({ data: { vulnerabilityId: vulns[1].id, assetId: assets[1].id, type: RemediationType.VIRTUAL_PATCH, targetSystem: 'WAF', ruleGenerated: 'SecRule REQUEST_HEADERS:Modbus "@contains 0x0021" "id:100001,phase:1,deny,status:403"', status: RemediationStatus.APPLIED, appliedAt: new Date() } }),
    prisma.remediationAction.create({ data: { vulnerabilityId: vulns[2].id, assetId: assets[3].id, type: RemediationType.VIRTUAL_PATCH, targetSystem: 'IPS', ruleGenerated: 'alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"CVE-2025-1003"; content:"/etc/passwd"; sid:100002;)', status: RemediationStatus.APPLIED, appliedAt: new Date() } }),
  ]);

  // WAF/IPs Rules
  await Promise.all([
    prisma.wafIpsRule.create({ data: { remediationActionId: rems[1].id, ruleType: 'regex', ruleBody: 'SecRule REQUEST_HEADERS:Modbus "@contains 0x0021" "id:100001,phase:1,deny,status:403"', deployedTo: 'modsecurity-waf', active: true } }),
    prisma.wafIpsRule.create({ data: { remediationActionId: rems[2].id, ruleType: 'signature', ruleBody: 'alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"CVE-2025-1003"; content:"/etc/passwd"; sid:100002;)', deployedTo: 'snort-ips', active: true } }),
  ]);

  // BAS Simulations
  await Promise.all([
    prisma.basSimulation.create({ data: { vulnerabilityId: vulns[0].id, scenario: 'RTSP buffer overflow attempt', result: 'confirmed_exploitable', ranAt: new Date() } }),
    prisma.basSimulation.create({ data: { vulnerabilityId: vulns[1].id, scenario: 'Modbus auth bypass attempt', result: 'confirmed_exploitable', ranAt: new Date() } }),
    prisma.basSimulation.create({ data: { vulnerabilityId: vulns[2].id, scenario: 'DNP3 shutdown packet injection', result: 'not_exploitable', ranAt: new Date() } }),
  ]);

  // DevSecOps Scans
  await Promise.all([
    prisma.devSecOpsScan.create({ data: { repoOrPipeline: 'main-infra/terraform', iacTool: 'terraform', findings: [{ severity: 'CRITICAL', rule: 'S3 bucket ACL public read', file: 's3.tf', line: 24 }, { severity: 'HIGH', rule: 'SSH port 22 open to 0.0.0.0/0', file: 'security_group.tf', line: 31 }], blockedDeploy: true } }),
    prisma.devSecOpsScan.create({ data: { repoOrPipeline: 'k8s-deploy/production', iacTool: 'kubernetes', findings: [{ severity: 'HIGH', rule: 'Container running as root', file: 'deployment.yaml', line: 15 }], blockedDeploy: true } }),
    prisma.devSecOpsScan.create({ data: { repoOrPipeline: 'ansible-playbooks/base-hardening', iacTool: 'ansible', findings: [{ severity: 'MEDIUM', rule: 'Unpinned package version', file: 'playbook.yml', line: 42 }], blockedDeploy: false } }),
  ]);

  // Incidents
  const incidents = await Promise.all([
    prisma.incident.create({ data: { vulnerabilityId: vulns[0].id, title: 'Smart Camera RCE Attempt - Mitigated', status: IncidentStatus.RESOLVED, timeline: [{ event: 'threat.detected', time: new Date(Date.now() - 86400000) }, { event: 'ai_decision.auto_isolate', time: new Date(Date.now() - 86000000) }, { event: 'remediation.applied', time: new Date(Date.now() - 85000000) }], resolvedAt: new Date(Date.now() - 84000000) } }),
    prisma.incident.create({ data: { vulnerabilityId: vulns[1].id, title: 'SCADA Auth Bypass - Virtual Patched', status: IncidentStatus.RESOLVED, timeline: [{ event: 'threat.detected', time: new Date(Date.now() - 43200000) }, { event: 'ai_decision.virtual_patch', time: new Date(Date.now() - 42800000) }, { event: 'remediation.applied', time: new Date(Date.now() - 42000000) }], resolvedAt: new Date(Date.now() - 41000000) } }),
    prisma.incident.create({ data: { vulnerabilityId: vulns[4].id, title: 'K8s RBAC Bypass - Under Analysis', status: IncidentStatus.OPEN, timeline: [{ event: 'threat.detected', time: new Date(Date.now() - 3600000) }] } }),
  ]);

  // Incident Reports
  await Promise.all([
    prisma.incidentReport.create({ data: { incidentId: incidents[0].id, generatedBy: 'llm', content: `## Incident Report: Smart Camera RCE Attempt\n\n### What Happened\nA critical vulnerability (CVE-2025-1001, CVSS 9.8) was detected on Smart Traffic Camera K-12 (10.0.1.12). The threat (RTSP Buffer Overflow) had no official patch available (zero-day).\n\n### How Detected\nTrend Micro ZDI feed flagged the threat. Asset-threat matching identified the camera as potentially vulnerable. Micro-scan confirmed the vulnerability.\n\n### Response\nAI Decision Maker calculated risk score 9.2 with 95% confidence → auto-isolation triggered. Asset was isolated via firewall rule. BAS simulation confirmed the vulnerability was exploitable before isolation.\n\n### Status\n✅ Resolved — asset isolated, no further exploitation possible.` } }),
    prisma.incidentReport.create({ data: { incidentId: incidents[1].id, generatedBy: 'llm', content: `## Incident Report: SCADA Auth Bypass\n\n### What Happened\nAuthentication bypass vulnerability (CVE-2025-1002, CVSS 9.1) detected on Water Treatment PLC-01.\n\n### How Detected\nZDI threat feed → asset matching → micro-scan confirmed.\n\n### Response\nAI recommended virtual patch with 92% confidence. ModSecurity WAF rule generated and deployed. BAS confirmed attack blocked after patching.\n\n### Status\n✅ Resolved — virtual patch active on WAF.` } }),
  ]);

  // Knowledge Base
  await Promise.all([
    prisma.knowledgeBaseEntry.create({ data: { pattern: 'camera:rtsp:buffer_overflow', description: 'IP cameras with RTSP streams vulnerable to buffer overflow', sourceIncidentId: incidents[0].id, autoApplyRule: { action: 'auto_isolate', targetSystem: 'firewall' }, timesReused: 3 } }),
    prisma.knowledgeBaseEntry.create({ data: { pattern: 'scada:modbus:auth_bypass', description: 'SCADA Modbus TCP gateways with authentication bypass', sourceIncidentId: incidents[1].id, autoApplyRule: { action: 'virtual_patch', targetSystem: 'WAF', ruleTemplate: 'SecRule ...' }, timesReused: 1 } }),
  ]);

  // Settings
  await Promise.all([
    prisma.setting.create({ data: { key: 'confidence_threshold_auto_execute', value: '90' } }),
    prisma.setting.create({ data: { key: 'threat_feed_provider', value: 'mock' } }),
    prisma.setting.create({ data: { key: 'waf_provider', value: 'mock' } }),
    prisma.setting.create({ data: { key: 'llm_provider', value: 'mock' } }),
  ]);

  // Audit Logs
  await Promise.all([
    prisma.auditLog.create({ data: { userId: admin.id, action: 'seed.completed', entityType: 'system', details: { message: 'Database seeded successfully with demo data' } } }),
    prisma.auditLog.create({ data: { userId: admin.id, action: 'incident.resolved', entityType: 'Incident', entityId: incidents[0].id, details: { title: incidents[0].title } } }),
  ]);

  console.log('✅ Seed completed successfully');
  console.log(`   Users: 3`);
  console.log(`   Assets: ${assetData.length}`);
  console.log(`   Threats: ${threats.length}`);
  console.log(`   Vulnerabilities: ${vulns.length}`);
  console.log(`   Incidents: ${incidents.length}`);
  console.log(`   KB Entries: 2`);
}

main()
  .catch(e => { console.error('Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
