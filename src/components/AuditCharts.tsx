// ===== IMPORTS & DEPENDENCIES =====
import React, { useEffect, useRef } from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  GscKeyword,
  TechnicalCrawlStats,
  SpeedAndCompetitor,
} from '../types/seo.ts';

Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// ===== TYPES & INTERFACES =====
interface AuditChartsProps {
  keywords: GscKeyword[];
  techStats: TechnicalCrawlStats;
  competitors: SpeedAndCompetitor[];
}

// ===== CORE CHART.JS VISUALIZATION COMPONENT =====
export const AuditCharts: React.FC<AuditChartsProps> = ({
  keywords,
  techStats,
  competitors,
}) => {
  const gscBarRef = useRef<HTMLCanvasElement | null>(null);
  const onPageDoughnutRef = useRef<HTMLCanvasElement | null>(null);
  const depthBarRef = useRef<HTMLCanvasElement | null>(null);
  const competitorRadarRef = useRef<HTMLCanvasElement | null>(null);

  const chartInstances = useRef<Chart[]>([]);

  useEffect(() => {
    // Destroy previous instances before re-rendering
    chartInstances.current.forEach((c) => c.destroy());
    chartInstances.current = [];

    const fontConfig = {
      family: "'Vazirmatn', sans-serif",
      size: 12,
    };

    // 1. Grouped Bar Chart: Current Clicks vs Estimated Rank 1 Clicks (Top 10 Keywords)
    if (gscBarRef.current) {
      const top10 = keywords.slice(0, 10);
      const labels = top10.map((k) =>
        k.query.length > 24 ? k.query.slice(0, 24) + '…' : k.query
      );

      const gscChart = new Chart(gscBarRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'کلیک فعلی (GSC)',
              data: top10.map((k) => k.clicks),
              backgroundColor: '#334155',
              borderRadius: 4,
            },
            {
              label: 'پتانسیل کلیک رتبه ۱ (CTR 28%)',
              data: top10.map((k) => k.estimated_clicks_top1),
              backgroundColor: '#4f46e5',
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { font: fontConfig, color: '#0f172a' },
            },
            tooltip: {
              titleFont: fontConfig,
              bodyFont: fontConfig,
            },
          },
          scales: {
            x: {
              ticks: { font: { ...fontConfig, size: 11 }, color: '#475569' },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              ticks: { font: fontConfig, color: '#475569' },
              grid: { color: 'rgba(148, 163, 184, 0.18)' },
            },
          },
        },
      });
      chartInstances.current.push(gscChart);
    }

    // 2. Doughnut Chart: On-Page Health Ratio
    if (onPageDoughnutRef.current && techStats) {
      const totalTitleIssues =
        techStats.duplicate_titles + techStats.missing_titles;
      const missingDesc = techStats.missing_descriptions;
      const missingH1 = techStats.missing_h1;
      const totalIssues = totalTitleIssues + missingDesc + missingH1;
      const healthyPages = Math.max(
        0,
        techStats.indexable_urls - Math.min(techStats.indexable_urls, Math.round(totalIssues * 0.65))
      );

      const doughnutChart = new Chart(onPageDoughnutRef.current, {
        type: 'doughnut',
        data: {
          labels: [
            'صفحات بهینه و بدون خطا',
            'خطای تایتل (تکراری / خالی)',
            'فاقد متا دیسکریپشن',
            'فاقد تگ H1',
          ],
          datasets: [
            {
              data: [healthyPages, totalTitleIssues, missingDesc, missingH1],
              backgroundColor: ['#16a34a', '#dc2626', '#d97706', '#4f46e5'],
              borderWidth: 2,
              borderColor: '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '64%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: fontConfig, color: '#0f172a', padding: 14 },
            },
            tooltip: {
              titleFont: fontConfig,
              bodyFont: fontConfig,
            },
          },
        },
      });
      chartInstances.current.push(doughnutChart);
    }

    // 3. Bar Chart: Click Depth Distribution (Highlighting Depth > 3 as Warning)
    if (depthBarRef.current && techStats) {
      const dist = techStats.click_depth_distribution_json || {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6+': 0,
      };
      const depthLabels = [
        'عمق ۱ (صفحه اصلی)',
        'عمق ۲ (بهینه)',
        'عمق ۳ (استاندارد)',
        'عمق ۴ (هشدار خزش)',
        'عمق ۵ (خطر بودجه خزش)',
        'عمق ۶+ (بحرانی)',
      ];
      const depthValues = [
        dist['1'] || 0,
        dist['2'] || 0,
        dist['3'] || 0,
        dist['4'] || 0,
        dist['5'] || 0,
        dist['6+'] || 0,
      ];

      const depthChart = new Chart(depthBarRef.current, {
        type: 'bar',
        data: {
          labels: depthLabels,
          datasets: [
            {
              label: 'تعداد صفحات در هر عمق کلیک',
              data: depthValues,
              backgroundColor: [
                '#16a34a',
                '#16a34a',
                '#2563eb',
                '#d97706',
                '#dc2626',
                '#991b1b',
              ],
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              titleFont: fontConfig,
              bodyFont: fontConfig,
            },
          },
          scales: {
            x: {
              ticks: { font: { ...fontConfig, size: 11 }, color: '#475569' },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              ticks: { font: fontConfig, color: '#475569' },
              grid: { color: 'rgba(148, 163, 184, 0.18)' },
            },
          },
        },
      });
      chartInstances.current.push(depthChart);
    }

    // 4. Radar Chart: Multi-Dimensional Competitor Comparison
    if (competitorRadarRef.current && competitors.length > 0) {
      const maxRefDomains = Math.max(
        1,
        ...competitors.map((c) => c.referring_domains)
      );

      const palette = [
        { border: '#4f46e5', bg: 'rgba(79, 70, 229, 0.18)' },
        { border: '#dc2626', bg: 'rgba(220, 38, 38, 0.10)' },
        { border: '#16a34a', bg: 'rgba(22, 163, 74, 0.10)' },
        { border: '#d97706', bg: 'rgba(217, 119, 6, 0.10)' },
      ];

      const radarChart = new Chart(competitorRadarRef.current, {
        type: 'radar',
        data: {
          labels: [
            'اعتبار دامنه (DR)',
            'دامنه‌های ارجاع‌دهنده (نرمال‌شده)',
            'سرعت موبایل (CWV)',
            'سرعت دسکتاپ (CWV)',
            'امتیاز پایداری LCP/CLS',
          ],
          datasets: competitors.slice(0, 4).map((comp, idx) => {
            const color = palette[idx % palette.length];
            const normalizedRef = Math.round(
              (comp.referring_domains / maxRefDomains) * 100
            );
            const cwvStability = Math.max(
              20,
              Math.min(
                100,
                Math.round(100 - (comp.lcp_seconds - 1.5) * 20 - comp.cls_score * 100)
              )
            );
            return {
              label: comp.is_main_site ? `${comp.domain} (سایت اصلی)` : comp.domain,
              data: [
                comp.dr_score,
                normalizedRef,
                comp.mobile_perf_score,
                comp.desktop_perf_score,
                cwvStability,
              ],
              borderColor: color.border,
              backgroundColor: color.bg,
              borderWidth: comp.is_main_site ? 2.5 : 1.75,
              pointBackgroundColor: color.border,
            };
          }),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: fontConfig, color: '#0f172a', padding: 12 },
            },
          },
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: {
                stepSize: 20,
                font: { family: "'JetBrains Mono', monospace", size: 10 },
                backdropColor: 'transparent',
              },
              pointLabels: {
                font: { ...fontConfig, size: 11 },
                color: '#334155',
              },
              grid: {
                color: 'rgba(148, 163, 184, 0.25)',
              },
            },
          },
        },
      });
      chartInstances.current.push(radarChart);
    }

    return () => {
      chartInstances.current.forEach((c) => c.destroy());
      chartInstances.current = [];
    };
  }, [keywords, techStats, competitors]);

  const depthOver3Count =
    (techStats?.click_depth_distribution_json?.['4'] || 0) +
    (techStats?.click_depth_distribution_json?.['5'] || 0) +
    (techStats?.click_depth_distribution_json?.['6+'] || 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      {/* 1. Grouped Bar Chart: GSC Clicks vs Top 1 Estimated Clicks */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 chart-container print-avoid-break">
        <div className="flex items-baseline justify-between mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ۰۱. پتانسیل رشد کلیک در رتبه ۱ گوگل (۱۰ کلمه کلیدی برتر)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              مقایسه کلیک فعلی سرچ کنسول با کلیک تخمینی در صورت کسب جایگاه اول (نرخ کلیک هدف ۲۸٪)
            </p>
          </div>
          <span className="text-xs text-indigo-700 font-mono tabular-nums shrink-0">
            CTR Target: 28.0%
          </span>
        </div>
        <div className="h-72 w-full">
          <canvas ref={gscBarRef} />
        </div>
      </div>

      {/* 2. Doughnut Chart: On-Page SEO Health */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 chart-container print-avoid-break">
        <div className="flex items-baseline justify-between mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ۰۲. توزیع سلامت On-Page (تایتل، دیسکریپشن و H1)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              نسبت صفحات ایندکس‌پذیر سالم به صفحات دارای نقص متاتگ در خزش Screaming Frog
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums shrink-0">
            {techStats?.indexable_urls.toLocaleString('fa-IR')} صفحه ایندکس‌پذیر
          </span>
        </div>
        <div className="h-72 w-full">
          <canvas ref={onPageDoughnutRef} />
        </div>
      </div>

      {/* 3. Bar Chart: Click Depth Distribution */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 chart-container print-avoid-break">
        <div className="flex items-baseline justify-between mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ۰۳. توزیع عمق کلیک صفحات سایت (Crawl Depth Distribution)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              صفحات واقع در عمق کلیک بالاتر از ۳ با رنگ هشدار (نارنجی/قرمز) مشخص شده‌اند
            </p>
          </div>
          <span className="text-xs text-red-700 font-medium font-mono tabular-nums shrink-0">
            هشدار عمق +۳: {depthOver3Count.toLocaleString('fa-IR')} صفحه
          </span>
        </div>
        <div className="h-72 w-full">
          <canvas ref={depthBarRef} />
        </div>
      </div>

      {/* 4. Radar Chart: Multi-Dimensional Competitor Benchmark */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 chart-container print-avoid-break">
        <div className="flex items-baseline justify-between mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ۰۴. نمودار راداری مقایسه چندوجهی با رقبا
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              مقایسه اعتبار دامنه (DR)، بک‌لینک‌ها، سرعت موبایل و سرعت دسکتاپ
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums shrink-0">
            {competitors.length} دامنه در مقایسه
          </span>
        </div>
        <div className="h-72 w-full">
          <canvas ref={competitorRadarRef} />
        </div>
      </div>
    </div>
  );
};
