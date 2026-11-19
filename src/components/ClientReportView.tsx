// ===== IMPORTS & DEPENDENCIES =====
import React, { useState } from 'react';
import {
  Printer,
  Share2,
  Check,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  FullAuditDetails,
  ReportSectionKey,
  ActionPriority,
  AssignedTeam,
} from '../types/seo.ts';
import { AuditCharts } from './AuditCharts.tsx';
import { ActionPlanTable } from './ActionPlanTable.tsx';
import { SECTION_LABELS } from './RichTextSectionEditor.tsx';

interface ClientReportViewProps {
  auditDetails: FullAuditDetails;
  isClientShareMode?: boolean;
  onToggleTask?: (taskId: number, completed: boolean) => Promise<void>;
  onAddTask?: (task: {
    task_title: string;
    category: string;
    priority: ActionPriority;
    impact_score: number;
    assigned_team: AssignedTeam;
  }) => Promise<void>;
  onDeleteTask?: (taskId: number) => Promise<void>;
}

const SECTION_ORDER: ReportSectionKey[] = [
  'executive_summary',
  'technical',
  'keyword_pillar',
  'onpage',
  'offpage_competitors',
  'speed_cwv',
];

// ===== EXECUTIVE & CLIENT GRAPHICAL REPORT VIEW =====
export const ClientReportView: React.FC<ClientReportViewProps> = ({
  auditDetails,
  isClientShareMode = false,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}) => {
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  const {
    audit,
    project,
    agency,
    gsc_keywords,
    technical_crawl_stats,
    speed_and_competitors,
    report_sections,
    action_plans,
  } = auditDetails;

  const totalCurrentClicks = gsc_keywords.reduce((sum, k) => sum + k.clicks, 0);
  const totalEstClicksTop1 = gsc_keywords.reduce(
    (sum, k) => sum + k.estimated_clicks_top1,
    0
  );
  const overallMultiplier =
    totalCurrentClicks > 0
      ? (totalEstClicksTop1 / totalCurrentClicks).toFixed(1)
      : '1.0';
  const quickWinsCount = gsc_keywords.filter((k) =>
    k.cluster_tag.includes('Quick Win')
  ).length;

  const mainSiteSpeed =
    speed_and_competitors.find((s) => s.is_main_site) || speed_and_competitors[0];

  const handleCopyShareUrl = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${audit.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Report Cover / Executive Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 print-avoid-break">
        <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
              <span className="font-semibold text-indigo-700">
                {agency.agency_name}
              </span>
              <span aria-hidden="true">·</span>
              <span>تهیه‌کننده: {agency.name}</span>
              <span aria-hidden="true">·</span>
              <span>تاریخ گزارش: {audit.audit_date}</span>
              <span aria-hidden="true">·</span>
              <span>
                وضعیت: {audit.status === 'published' ? 'منتشرشده نهایی' : 'پیش‌نویس کارشناسی'}
              </span>
            </div>

            <h1
              className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              {audit.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-3">
              <span>
                دامنه هدف:{' '}
                <strong className="font-mono text-slate-900" dir="ltr">
                  {project.domain}
                </strong>
              </span>
              <span aria-hidden="true">/</span>
              <span>کارفرما: {project.client_name}</span>
              <span aria-hidden="true">/</span>
              <span>زیرساخت فنی: {project.cms_type}</span>
              <span aria-hidden="true">/</span>
              <span>صنعت: {project.industry}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 no-print shrink-0">
            <button
              type="button"
              onClick={handleCopyShareUrl}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              {copiedShareLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>لینک اختصاصی کارفرما کپی شد</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>کپی لینک اختصاصی کارفرما</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ / خروجی PDF استاندارد A4</span>
            </button>
          </div>
        </div>

        {/* 4-Column Executive KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          <div>
            <div className="text-xs text-slate-500">
              پتانسیل کلیک ماهانه رتبه ۱ (CTR 28%)
            </div>
            <div className="text-2xl font-extrabold text-indigo-700 font-mono tabular-nums mt-1">
              {totalEstClicksTop1.toLocaleString('en-US')}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              کلیک فعلی: {totalCurrentClicks.toLocaleString('en-US')} · ضریب رشد:{' '}
              <strong className="font-mono text-slate-900">{overallMultiplier}x</strong>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">
              کلمات کلیدی فرصت سریع (Quick Wins)
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
              {quickWinsCount} عبارت
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Impressions &gt; 1,000 · جایگاه ۴ تا ۱۵
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">
              نسبت صفحات ایندکس‌پذیر (Indexability)
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
              {technical_crawl_stats.indexable_urls.toLocaleString('en-US')}{' '}
              <span className="text-sm font-normal text-slate-400">
                / {technical_crawl_stats.total_urls.toLocaleString('en-US')}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              خطای 404: {technical_crawl_stats.status_404_count} · ریدایرکت 301:{' '}
              {technical_crawl_stats.status_301_count}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">
              امتیاز سرعت PageSpeed و LCP موبایل
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
              {mainSiteSpeed ? `${mainSiteSpeed.mobile_perf_score} / 100` : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
              LCP: {mainSiteSpeed?.lcp_seconds ?? 0}s · INP: {mainSiteSpeed?.inp_ms ?? 0}ms · CLS:{' '}
              {mainSiteSpeed?.cls_score ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Interactive Chart.js Visualizations */}
      <AuditCharts
        keywords={gsc_keywords}
        techStats={technical_crawl_stats}
        competitors={speed_and_competitors}
      />

      {/* Top GSC Keywords & Growth Potential Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden print-avoid-break">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              جدول تحلیل کلمات کلیدی سرچ کنسول و تخمین رشد ترافیک در رتبه ۱
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              محاسبه‌شده با فرمول نرخ کلیک استاندارد رتبه اول گوگل (CTR = 28%) و شناسایی خودکار عبارات Quick Win
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            نمایش {Math.min(15, gsc_keywords.length)} عبارت برتر بر اساس Impression
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-2.5 px-4">کلمه کلیدی (Query)</th>
                <th className="py-2.5 px-4">خوشه استراتژیک (Cluster Tag)</th>
                <th className="py-2.5 px-4 text-left">کلیک فعلی</th>
                <th className="py-2.5 px-4 text-left">نمایش (Impressions)</th>
                <th className="py-2.5 px-4 text-left">CTR فعلی</th>
                <th className="py-2.5 px-4 text-left">جایگاه</th>
                <th className="py-2.5 px-4 text-left text-indigo-700">
                  کلیک تخمینی رتبه ۱
                </th>
                <th className="py-2.5 px-4 text-left">ضریب رشد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {gsc_keywords.slice(0, 15).map((kw) => {
                const isQuickWin = kw.cluster_tag.includes('Quick Win');
                return (
                  <tr
                    key={kw.id}
                    className={`hover:bg-slate-50/80 ${
                      isQuickWin ? 'bg-indigo-50/25' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {kw.query}
                    </td>
                    <td
                      className={`py-2.5 px-4 ${
                        isQuickWin
                          ? 'text-indigo-700 font-semibold'
                          : 'text-slate-600'
                      }`}
                    >
                      {kw.cluster_tag}
                    </td>
                    <td className="py-2.5 px-4 text-left font-mono tabular-nums text-slate-700">
                      {kw.clicks.toLocaleString('en-US')}
                    </td>
                    <td className="py-2.5 px-4 text-left font-mono tabular-nums text-slate-700">
                      {kw.impressions.toLocaleString('en-US')}
                    </td>
                    <td className="py-2.5 px-4 text-left font-mono tabular-nums text-slate-600">
                      {kw.ctr}%
                    </td>
                    <td className="py-2.5 px-4 text-left font-mono tabular-nums font-medium text-slate-900">
                      {kw.position}
                    </td>
                    <td className="py-2.5 px-4 text-left font-mono tabular-nums font-bold text-indigo-700">
                      {kw.estimated_clicks_top1.toLocaleString('en-US')}
                    </td>
                    <td className="py-2.5 px-4 text-left font-mono tabular-nums font-semibold text-emerald-700">
                      {kw.growth_multiplier}x
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6 Analytical AI + Expert Edited Sections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            گزارش تحلیلی و استراتژیک سئو (AI & Senior Consultant Analysis)
          </h2>
          <span className="text-xs text-slate-500">
            ۶ فصل تخصصی مبتنی بر داده‌های واقعی پروژه
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {SECTION_ORDER.map((key) => {
            const section = report_sections.find((s) => s.section_key === key);
            const meta = SECTION_LABELS[key];
            if (!section) return null;

            return (
              <section
                key={key}
                className="bg-white border border-slate-200 rounded-xl p-6 report-section-block print-avoid-break"
              >
                <div className="pb-3 mb-4 border-b border-slate-100 flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-600 ml-2">
                      فصل {meta.number}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 inline">
                      {meta.title}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">{meta.subtitle}</span>
                </div>

                <div
                  className="seo-prose text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: section.final_edited_html || section.ai_generated_html,
                  }}
                />
              </section>
            );
          })}
        </div>
      </div>

      {/* Interactive Action Plan Table with Filters, CSV Export & A4 Print */}
      <ActionPlanTable
        tasks={action_plans}
        domain={project.domain}
        readOnly={isClientShareMode}
        onToggleTask={onToggleTask}
        onAddTask={onAddTask}
        onDeleteTask={onDeleteTask}
      />

      {/* Agency Footer Signature for Print & Client View */}
      <footer className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 print-avoid-break">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="font-semibold text-slate-800">{agency.agency_name}</span>
          <span aria-hidden="true">·</span>
          <span>{agency.agency_contact}</span>
        </div>
        <div className="font-mono text-slate-400" dir="ltr">
          Share Token: {audit.share_token}
        </div>
      </footer>
    </div>
  );
};
