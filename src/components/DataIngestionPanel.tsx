// ===== IMPORTS & DEPENDENCIES =====
import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Gauge,
  Download,
  RefreshCw,
  Check,
} from 'lucide-react';
import {
  FullAuditDetails,
  GscKeyword,
  TechnicalCrawlStats,
  SpeedAndCompetitor,
} from '../types/seo.ts';

interface DataIngestionPanelProps {
  auditDetails: FullAuditDetails;
  onGscUpdated: (keywords: GscKeyword[]) => void;
  onTechUpdated: (stats: TechnicalCrawlStats) => void;
  onSpeedUpdated: (competitors: SpeedAndCompetitor[]) => void;
}

// ===== SAMPLE CSV GENERATORS FOR ONE-CLICK TESTING =====
const SAMPLE_GSC_CSV = `Top queries,Clicks,Impressions,CTR,Position
خرید گوشی سامسونگ s24 fe,3850,74200,5.19%,5.3
قیمت لپ تاپ لنوو loq گیمینگ,2940,61800,4.76%,6.1
بهترین گوشی شیائومی تا ۲۵ میلیون,2410,49500,4.87%,5.7
خرید ایرپاد پرو ۲ اصلی,1980,38400,5.16%,4.9
لیست قیمت تبلت سامسونگ,3120,54000,5.78%,4.4
مقایسه آیفون ۱۶ با سامسونگ s24,1150,33900,3.39%,8.2
خرید ساعت هوشمند اپل واچ سری ۱۰,1760,31200,5.64%,5.8
قیمت هارد اکسترنال وسترن دیجیتال ۲ ترابایت,2290,28700,7.98%,3.9
خرید مانیتور گیمینگ ایسوس ۱۶۵ هرتز,1340,26500,5.06%,6.4
پاوربانک شیائومی ۲۰۰۰۰ فست شارژ,1890,25100,7.53%,4.3`;

const SAMPLE_SF_CSV = `Address,Status Code,Indexability,Title 1,Meta Description 1,H1-1,Crawl Depth
https://example.ir/,200,Indexable,فروشگاه اینترنتی کالای دیجیتال,خرید انواع گوشی و لپ تاپ با گارانتی معتبر,فروشگاه کالای دیجیتال,1
https://example.ir/mobile/samsung,200,Indexable,قیمت و خرید گوشی سامسونگ,لیست قیمت روز گوشی سامسونگ,گوشی سامسونگ,2
https://example.ir/mobile/samsung?page=2,200,Indexable,قیمت و خرید گوشی سامسونگ,,گوشی سامسونگ,3
https://example.ir/mobile/apple,200,Indexable,قیمت و خرید آیفون اپل,خرید آیفون با گارانتی شرکتی,,2
https://example.ir/laptop/asus,200,Indexable,خرید لپ تاپ ایسوس,,لپ تاپ ایسوس,2
https://example.ir/laptop/asus?page=2,200,Indexable,خرید لپ تاپ ایسوس,,,4
https://example.ir/old-promo,404,Non-Indexable,,,,4
https://example.ir/legacy-blog,301,Non-Indexable,,,,5
https://example.ir/archive/deep-item-1,200,Indexable,,,آیتم آرشیوی ۱,5
https://example.ir/archive/deep-item-2,200,Indexable,,,,6`;

// ===== DATA INGESTION & PARSER PANEL COMPONENT =====
export const DataIngestionPanel: React.FC<DataIngestionPanelProps> = ({
  auditDetails,
  onGscUpdated,
  onTechUpdated,
  onSpeedUpdated,
}) => {
  const [gscCsvText, setGscCsvText] = useState<string>('');
  const [gscMinImp, setGscMinImp] = useState<number>(50);
  const [gscLoading, setGscLoading] = useState<boolean>(false);
  const [gscResultMsg, setGscResultMsg] = useState<string>('');

  const [sfCsvText, setSfCsvText] = useState<string>('');
  const [sfLoading, setSfLoading] = useState<boolean>(false);
  const [sfResultMsg, setSfResultMsg] = useState<string>('');

  const [psiDomain, setPsiDomain] = useState<string>(auditDetails.project.domain);
  const [psiIsMain, setPsiIsMain] = useState<boolean>(true);
  const [psiDr, setPsiDr] = useState<number>(56);
  const [psiRefDomains, setPsiRefDomains] = useState<number>(1540);
  const [psiLoading, setPsiLoading] = useState<boolean>(false);
  const [psiResultMsg, setPsiResultMsg] = useState<string>('');

  const handleFileRead = (
    file: File | undefined,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setter(String(ev.target?.result || ''));
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleParseGsc = async (csvToParse: string) => {
    if (!csvToParse.trim()) return;
    setGscLoading(true);
    setGscResultMsg('');
    try {
      const resp = await fetch(`/api/audits/${auditDetails.audit.id}/parse-gsc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: csvToParse, minImpressions: gscMinImp }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'خطا در پردازش CSV');
      onGscUpdated(data.gsc_keywords);
      setGscResultMsg(
        `${data.inserted_count} کلمه کلیدی پردازش شد (${data.quick_wins_count} فرصت سریع / Quick Win شناسایی شد).`
      );
    } catch (err: any) {
      setGscResultMsg(`خطا: ${err.message}`);
    } finally {
      setGscLoading(false);
    }
  };

  const handleParseSf = async (csvToParse: string) => {
    if (!csvToParse.trim()) return;
    setSfLoading(true);
    setSfResultMsg('');
    try {
      const resp = await fetch(`/api/audits/${auditDetails.audit.id}/parse-sf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: csvToParse }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'خطا در پردازش Screaming Frog');
      onTechUpdated(data.technical_crawl_stats);
      setSfResultMsg(
        `خزش تکنیکال پردازش شد: ${data.technical_crawl_stats.total_urls} آدرس کل، ${data.technical_crawl_stats.indexable_urls} صفحه قابل ایندکس.`
      );
    } catch (err: any) {
      setSfResultMsg(`خطا: ${err.message}`);
    } finally {
      setSfLoading(false);
    }
  };

  const handleRunPageSpeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!psiDomain.trim()) return;
    setPsiLoading(true);
    setPsiResultMsg('');
    try {
      const resp = await fetch(`/api/audits/${auditDetails.audit.id}/pagespeed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: psiDomain.trim(),
          is_main_site: psiIsMain,
          dr_score: psiDr,
          referring_domains: psiRefDomains,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'خطا در اجرای PageSpeed');
      onSpeedUpdated(data.speed_and_competitors);
      setPsiResultMsg(
        `دامنه ${data.record.domain} آنالیز شد — سرعت موبایل: ${data.record.mobile_perf_score}، دسکتاپ: ${data.record.desktop_perf_score}، LCP: ${data.record.lcp_seconds}s`
      );
    } catch (err: any) {
      setPsiResultMsg(`خطا: ${err.message}`);
    } finally {
      setPsiLoading(false);
    }
  };

  const downloadSampleFile = (filename: string, content: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top 2-Column Split: GSC Queries.csv & Screaming Frog internal_all.csv */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* A. Google Search Console Parser */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    الف) پارسر فایل سرچ کنسول (Queries.csv)
                  </h3>
                  <p className="text-xs text-slate-500">
                    محاسبه فرمول استاندارد CTR رتبه ۱ (۲۸٪) و تشخیص خودکار کلمات Quick Win
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => downloadSampleFile('Queries_Sample.csv', SAMPLE_GSC_CSV)}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>دانلود نمونه CSV</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 mb-4 text-xs text-slate-600 space-y-1">
              <div className="font-mono text-[11px] text-slate-800" dir="ltr">
                estimated_clicks_top1 = ROUND(impressions * 0.28)
              </div>
              <div className="font-mono text-[11px] text-slate-800" dir="ltr">
                growth_multiplier = (clicks &gt; 0) ? ROUND(est_top1 / clicks, 1) : est_top1
              </div>
              <p className="text-slate-500 pt-1">
                کلمات دارای <span className="font-mono">impressions &gt; 1000</span> و جایگاه بین{' '}
                <span className="font-mono">4 تا 15</span> به عنوان{' '}
                <strong className="text-indigo-700">Quick Wins (فرصت‌های سریع)</strong> علامت‌گذاری می‌شوند.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer px-4 py-2.5 border border-dashed border-slate-300 rounded-lg hover:border-indigo-500 bg-slate-50/50 text-xs text-slate-700 flex items-center justify-center gap-2 transition-colors">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>انتخاب فایل Queries.csv از سیستم</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => handleFileRead(e.target.files?.[0], setGscCsvText)}
                  />
                </label>

                <div className="w-36">
                  <label className="block text-[11px] text-slate-500 mb-0.5">
                    حداقل Impression
                  </label>
                  <input
                    type="number"
                    value={gscMinImp}
                    onChange={(e) => setGscMinImp(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <textarea
                value={gscCsvText}
                onChange={(e) => setGscCsvText(e.target.value)}
                dir="ltr"
                rows={5}
                placeholder="Top queries,Clicks,Impressions,CTR,Position&#10;خرید گوشی سامسونگ,4200,68500,6.13%,5.4"
                className="w-full p-2.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setGscCsvText(SAMPLE_GSC_CSV);
                handleParseGsc(SAMPLE_GSC_CSV);
              }}
              className="px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              تست فوری با دیتای نمونه GSC
            </button>

            <button
              type="button"
              disabled={gscLoading || !gscCsvText.trim()}
              onClick={() => handleParseGsc(gscCsvText)}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              {gscLoading ? 'در حال پردازش...' : 'پردازش و ذخیره در gsc_keywords'}
            </button>
          </div>

          {gscResultMsg && (
            <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0" />
              <span>{gscResultMsg}</span>
            </div>
          )}
        </div>

        {/* B. Screaming Frog Stream Aggregator */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    ب) پارسر اسکریمینگ فراگ (internal_all.csv)
                  </h3>
                  <p className="text-xs text-slate-500">
                    پردازش جریانی در حافظه بدون ذخیره سطرهای خام و استخراج توزیع عمق کلیک
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => downloadSampleFile('internal_all_sample.csv', SAMPLE_SF_CSV)}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>دانلود نمونه CSV</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 mb-4 text-xs text-slate-600 space-y-1">
              <p>
                شمارش خودکار صفحات <span className="font-mono">Indexability == 'Indexable'</span>، متاتایتل‌های تکراری و خالی، متا دیسکریپشن خالی، H1 خالی و کدهای 404/301.
              </p>
              <p className="text-slate-500">
                تولید آرایه JSON توزیع عمق کلیک (<span className="font-mono">Crawl Depth 1 تا +6</span>) و ذخیره در جدول <span className="font-mono">technical_crawl_stats</span>.
              </p>
            </div>

            <div className="space-y-3">
              <label className="cursor-pointer px-4 py-2.5 border border-dashed border-slate-300 rounded-lg hover:border-emerald-600 bg-slate-50/50 text-xs text-slate-700 flex items-center justify-center gap-2 transition-colors">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>انتخاب فایل internal_all.csv خروجی Screaming Frog</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => handleFileRead(e.target.files?.[0], setSfCsvText)}
                />
              </label>

              <textarea
                value={sfCsvText}
                onChange={(e) => setSfCsvText(e.target.value)}
                dir="ltr"
                rows={5}
                placeholder="Address,Status Code,Indexability,Title 1,Meta Description 1,H1-1,Crawl Depth"
                className="w-full p-2.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setSfCsvText(SAMPLE_SF_CSV);
                handleParseSf(SAMPLE_SF_CSV);
              }}
              className="px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              تست فوری با دیتای نمونه Screaming Frog
            </button>

            <button
              type="button"
              disabled={sfLoading || !sfCsvText.trim()}
              onClick={() => handleParseSf(sfCsvText)}
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              {sfLoading ? 'در حال استخراج آمار...' : 'پردازش و ذخیره در technical_crawl_stats'}
            </button>
          </div>

          {sfResultMsg && (
            <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0" />
              <span>{sfResultMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* C. Google PageSpeed Insights API v5 & Competitor CWV Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Gauge className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ج) سرویس Google PageSpeed Insights API v5 و اعتبار دامنه رقبا
              </h3>
              <p className="text-xs text-slate-500">
                استخراج خودکار امتیاز Performance موبایل و دسکتاپ + متریک‌های LCP، INP و CLS و ذخیره در جدول speed_and_competitors
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500" dir="ltr">
            GET /pagespeedonline/v5/runPagespeed?strategy=mobile|desktop
          </span>
        </div>

        <form
          onSubmit={handleRunPageSpeed}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80"
        >
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              آدرس دامنه (اصلی یا رقیب)
            </label>
            <input
              type="text"
              required
              dir="ltr"
              value={psiDomain}
              onChange={(e) => setPsiDomain(e.target.value)}
              placeholder="example.ir"
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              نوع دامنه
            </label>
            <select
              value={psiIsMain ? 'main' : 'competitor'}
              onChange={(e) => setPsiIsMain(e.target.value === 'main')}
              className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg"
            >
              <option value="main">سایت اصلی کارفرما</option>
              <option value="competitor">دامنه رقیب</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              اعتبار دامنه (DR 0-100)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={psiDr}
              onChange={(e) => setPsiDr(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              دامنه‌های ارجاع‌دهنده (Ref Domains)
            </label>
            <input
              type="number"
              min={0}
              value={psiRefDomains}
              onChange={(e) => setPsiRefDomains(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={psiLoading}
              className="w-full px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${psiLoading ? 'animate-spin' : ''}`} />
              <span>{psiLoading ? 'در حال تست PSI...' : 'استعلام PageSpeed'}</span>
            </button>
          </div>
        </form>

        {psiResultMsg && (
          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{psiResultMsg}</span>
          </div>
        )}

        {/* Current Speed & Competitors Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-2.5 px-4">دامنه</th>
                <th className="py-2.5 px-4">نقش</th>
                <th className="py-2.5 px-4 text-left">DR Score</th>
                <th className="py-2.5 px-4 text-left">Referring Domains</th>
                <th className="py-2.5 px-4 text-left">سرعت موبایل</th>
                <th className="py-2.5 px-4 text-left">سرعت دسکتاپ</th>
                <th className="py-2.5 px-4 text-left">LCP (ثانیه)</th>
                <th className="py-2.5 px-4 text-left">INP (ms)</th>
                <th className="py-2.5 px-4 text-left">CLS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {auditDetails.speed_and_competitors.map((row) => (
                <tr
                  key={row.id}
                  className={
                    row.is_main_site ? 'bg-indigo-50/40 font-semibold text-slate-900' : 'text-slate-700'
                  }
                >
                  <td className="py-2.5 px-4 font-mono" dir="ltr">
                    {row.domain}
                  </td>
                  <td className="py-2.5 px-4">
                    {row.is_main_site ? 'سایت اصلی کارفرما' : 'رقیب'}
                  </td>
                  <td className="py-2.5 px-4 text-left font-mono tabular-nums">
                    {row.dr_score}
                  </td>
                  <td className="py-2.5 px-4 text-left font-mono tabular-nums">
                    {row.referring_domains.toLocaleString('en-US')}
                  </td>
                  <td
                    className={`py-2.5 px-4 text-left font-mono tabular-nums ${
                      row.mobile_perf_score >= 75
                        ? 'text-emerald-700'
                        : row.mobile_perf_score >= 55
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}
                  >
                    {row.mobile_perf_score} / 100
                  </td>
                  <td className="py-2.5 px-4 text-left font-mono tabular-nums text-emerald-700">
                    {row.desktop_perf_score} / 100
                  </td>
                  <td
                    className={`py-2.5 px-4 text-left font-mono tabular-nums ${
                      row.lcp_seconds <= 2.5 ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {row.lcp_seconds}s
                  </td>
                  <td className="py-2.5 px-4 text-left font-mono tabular-nums">
                    {row.inp_ms}ms
                  </td>
                  <td className="py-2.5 px-4 text-left font-mono tabular-nums">
                    {row.cls_score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
