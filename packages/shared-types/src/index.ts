// ===== ENUMS =====
export type Role = 'ADMIN' | 'SOC_ANALYST' | 'VIEWER' | 'DEVSECOPS_ENGINEER';
export type AssetType = 'IOT_SENSOR' | 'CLOUD_OBJECT' | 'SERVER' | 'CAMERA' | 'WATER_SYSTEM' | 'NETWORK_DEVICE' | 'UNKNOWN';
export type Criticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AssetStatus = 'ACTIVE' | 'ISOLATED' | 'OFFLINE';
export type VulnerabilityStatus = 'DETECTED' | 'ANALYZING' | 'MITIGATED' | 'FALSE_POSITIVE';
export type ScanJobStatus = 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED';
export type RemediationStatus = 'PENDING' | 'APPLIED' | 'FAILED' | 'ROLLED_BACK';
export type IncidentStatus = 'OPEN' | 'CONTAINED' | 'RESOLVED';
export type BASResult = 'confirmed_exploitable' | 'not_exploitable' | 'inconclusive';

// ===== API RESPONSES =====
export interface AuthResponse {
  token: string;
  user: { id: string; email: string; name: string | null; role: Role };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ===== DASHBOARD =====
export interface DashboardStats {
  totalAssets: number;
  activeVulnerabilities: number;
  openIncidents: number;
  autoResolvedPercent: number;
  riskTrend: { date: string; critical: number; high: number; medium: number }[];
  topCriticalAssets: { id: string; name: string; type: AssetType; status: AssetStatus }[];
}

// ===== WS EVENTS =====
export interface WsEvent {
  type: WsEventType;
  data: Record<string, unknown>;
  timestamp: string;
}

export type WsEventType =
  | 'asset.discovered'
  | 'threat.new'
  | 'scan.started'
  | 'scan.completed'
  | 'vulnerability.detected'
  | 'ai_decision.made'
  | 'remediation.applied'
  | 'bas.completed'
  | 'devsecops.scan_completed'
  | 'incident.created'
  | 'incident.resolved'
  | 'report.generated'
  | 'knowledge_base.fast_path_used';

// ===== PROVIDER INTERFACES =====
export interface IThreatFeedProvider {
  fetchLatestThreats(): Promise<ThreatFeedEntry[]>;
}

export interface ThreatFeedEntry {
  cveId?: string;
  title: string;
  description: string;
  severity: string;
  hasOfficialPatch: boolean;
}

export interface IWafProvider {
  deployRule(ruleBody: string, targetSystem: string): Promise<{ success: boolean; deployedTo: string }>;
  rollbackRule(ruleId: string): Promise<boolean>;
}

export interface ILlmProvider {
  generateReport(context: ReportContext): Promise<string>;
  generateReasoning(vulnContext: VulnContext): Promise<string>;
}

export interface ReportContext {
  incidentId: string;
  threatTitle: string;
  assetName: string;
  cvssScore: number;
  confidenceScore: number;
  timeline: unknown[];
}

export interface VulnContext {
  cveId?: string;
  cvssScore: number;
  epssScore: number;
  assetCriticality: Criticality;
  assetType: AssetType;
}
