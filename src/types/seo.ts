// ===== TYPES & INTERFACES (MySQL 8.0 Schema Mirror) =====

export type ReportSectionKey =
  | 'executive_summary'
  | 'technical'
  | 'keyword_pillar'
  | 'onpage'
  | 'offpage_competitors'
  | 'speed_cwv';

export type ActionPriority = 'high' | 'medium' | 'low';
export type AssignedTeam = 'technical' | 'content' | 'seo' | 'ui_ux';

export interface UserAgency {
  id: number;
  name: string;
  email: string;
  agency_name: string;
  agency_logo: string;
  agency_contact: string;
  created_at: string;
}

export interface Project {
  id: number;
  user_id: number;
  domain: string;
  client_name: string;
  cms_type: string;
  industry: string;
  competitors_json: string[];
  created_at: string;
}

export interface Audit {
  id: number;
  project_id: number;
  title: string;
  audit_date: string;
  share_token: string;
  share_password: string | null;
  status: 'draft' | 'published';
  created_at: string;
}

export interface GscKeyword {
  id: number;
  audit_id: number;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  estimated_clicks_top1: number;
  growth_multiplier: number;
  cluster_tag: string;
}

export interface ClickDepthDistribution {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
  '6+': number;
}

export interface TechnicalCrawlStats {
  id: number;
  audit_id: number;
  total_urls: number;
  indexable_urls: number;
  duplicate_titles: number;
  missing_titles: number;
  missing_descriptions: number;
  missing_h1: number;
  status_404_count: number;
  status_301_count: number;
  click_depth_distribution_json: ClickDepthDistribution;
}

export interface SpeedAndCompetitor {
  id: number;
  audit_id: number;
  domain: string;
  is_main_site: boolean;
  dr_score: number;
  referring_domains: number;
  mobile_perf_score: number;
  desktop_perf_score: number;
  lcp_seconds: number;
  inp_ms: number;
  cls_score: number;
}

export interface ReportSection {
  id: number;
  audit_id: number;
  section_key: ReportSectionKey;
  ai_generated_html: string;
  final_edited_html: string;
  updated_at: string;
}

export interface ActionPlanItem {
  id: number;
  audit_id: number;
  task_title: string;
  category: string;
  priority: ActionPriority;
  impact_score: number;
  assigned_team: AssignedTeam;
  is_completed: boolean;
}

export interface FullAuditDetails {
  audit: Audit;
  project: Project;
  agency: UserAgency;
  gsc_keywords: GscKeyword[];
  technical_crawl_stats: TechnicalCrawlStats;
  speed_and_competitors: SpeedAndCompetitor[];
  report_sections: ReportSection[];
  action_plans: ActionPlanItem[];
}
