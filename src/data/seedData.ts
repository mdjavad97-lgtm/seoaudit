// ===== INITIAL SEED DATA (3 Enterprise Persian Projects & Multi-Date Audits) =====

import {
  UserAgency,
  Project,
  Audit,
  GscKeyword,
  TechnicalCrawlStats,
  SpeedAndCompetitor,
  ReportSection,
  ActionPlanItem,
} from '../types/seo.ts';

export const initialAgency: UserAgency = {
  id: 1,
  name: 'مهندس آرش رادمنش',
  email: 'arash.rad@novinseo.ir',
  agency_name: 'آژانس مهندسی سئو و رشد نووین (NovinSEO Enterprise)',
  agency_logo: 'https://novinseo.ir/logo.svg',
  agency_contact: 'تهران، جردن، برج افرا، طبقه ۹ | ۰۲۱-۸۸۹۹۴۴۱۱ | strategy@novinseo.ir',
  created_at: '2026-01-10T09:00:00Z',
};

export const initialProjects: Project[] = [
  {
    id: 1,
    user_id: 1,
    domain: 'technolife-plus.ir',
    client_name: 'فروشگاه اینترنتی تکنولایف پلاس',
    cms_type: 'Next.js + Laravel Headless',
    industry: 'فروشگاه آنلاین کالای دیجیتال و موبایل',
    competitors_json: ['digikala.com', 'technolife.ir', 'mobit.ir', 'kalatik.com'],
    created_at: '2026-02-15T10:30:00Z',
  },
  {
    id: 2,
    user_id: 1,
    domain: 'iranhotel-booking.com',
    client_name: 'سامانه رزرواسیون هتل و پرواز ایران‌هتل',
    cms_type: 'ASP.NET Core + React SSR',
    industry: 'گردشگری، رزرو هتل و بلیط هواپیما',
    competitors_json: ['snapptrip.com', 'alibaba.ir', 'jabama.com'],
    created_at: '2026-03-01T11:15:00Z',
  },
  {
    id: 3,
    user_id: 1,
    domain: 'parseh-academy.ir',
    client_name: 'آکادمی آموزش برنامه‌نویسی پارسه',
    cms_type: 'WordPress + WooCommerce',
    industry: 'آموزش آنلاین تخصصی و بوت‌کمپ برنامه‌نویسی',
    competitors_json: ['faradars.org', 'maktabkhooneh.org', 'roocket.ir'],
    created_at: '2026-04-12T08:45:00Z',
  },
];

export const initialAudits: Audit[] = [
  {
    id: 101,
    project_id: 1,
    title: 'گزارش جامع آنالیز سئو تکنیکال، محتوایی و استراتژی Q3 1405',
    audit_date: '2026-11-15',
    share_token: 'tlp-q3-1405-audit-9f8a7b',
    share_password: null,
    status: 'published',
    created_at: '2026-11-15T14:20:00Z',
  },
  {
    id: 102,
    project_id: 1,
    title: 'آدیت اولیه مهاجرت ساختار URL و بررسی Core Web Vitals',
    audit_date: '2026-08-10',
    share_token: 'tlp-q2-1405-migration-3c2d1e',
    share_password: null,
    status: 'published',
    created_at: '2026-08-10T11:00:00Z',
  },
  {
    id: 201,
    project_id: 2,
    title: 'آنالیز کلاسترهای سئو محلی هتل‌ها و بهینه‌سازی صفحات فرود شهرها',
    audit_date: '2026-11-05',
    share_token: 'ihb-autumn-1405-seo-7e6f5a',
    share_password: null,
    status: 'published',
    created_at: '2026-11-05T16:40:00Z',
  },
  {
    id: 301,
    project_id: 3,
    title: 'بررسی سلامت On-Page و رفع مشکلات Duplicate Title ووکامرس',
    audit_date: '2026-10-28',
    share_token: 'parseh-wp-audit-1405-4b5c6d',
    share_password: null,
    status: 'draft',
    created_at: '2026-10-28T09:30:00Z',
  },
];

export const initialGscKeywords: GscKeyword[] = [
  // Audit 101 (technolife-plus.ir)
  {
    id: 1,
    audit_id: 101,
    query: 'خرید گوشی سامسونگ a55',
    clicks: 4200,
    impressions: 68500,
    ctr: 6.13,
    position: 5.4,
    estimated_clicks_top1: Math.round(68500 * 0.28),
    growth_multiplier: Number((Math.round(68500 * 0.28) / 4200).toFixed(1)),
    cluster_tag: 'Quick Win (فرصت سریع)',
  },
  {
    id: 2,
    audit_id: 101,
    query: 'قیمت آیفون 16 پرومکس',
    clicks: 5120,
    impressions: 94000,
    ctr: 5.45,
    position: 6.2,
    estimated_clicks_top1: Math.round(94000 * 0.28),
    growth_multiplier: Number((Math.round(94000 * 0.28) / 5120).toFixed(1)),
    cluster_tag: 'Quick Win (فرصت سریع)',
  },
  {
    id: 3,
    audit_id: 101,
    query: 'لپ تاپ ایسوس تاف گیمینگ',
    clicks: 2890,
    impressions: 52400,
    ctr: 5.52,
    position: 4.8,
    estimated_clicks_top1: Math.round(52400 * 0.28),
    growth_multiplier: Number((Math.round(52400 * 0.28) / 2890).toFixed(1)),
    cluster_tag: 'Quick Win (فرصت سریع)',
  },
  {
    id: 4,
    audit_id: 101,
    query: 'خرید هندزفری بلوتوثی شیائومی',
    clicks: 1650,
    impressions: 41200,
    ctr: 4.0,
    position: 7.9,
    estimated_clicks_top1: Math.round(41200 * 0.28),
    growth_multiplier: Number((Math.round(41200 * 0.28) / 1650).toFixed(1)),
    cluster_tag: 'Quick Win (فرصت سریع)',
  },
  {
    id: 5,
    audit_id: 101,
    query: 'لیست قیمت گوشی شیائومی',
    clicks: 6400,
    impressions: 82000,
    ctr: 7.8,
    position: 4.2,
    estimated_clicks_top1: Math.round(82000 * 0.28),
    growth_multiplier: Number((Math.round(82000 * 0.28) / 6400).toFixed(1)),
    cluster_tag: 'Quick Win (فرصت سریع)',
  },
  {
    id: 6,
    audit_id: 101,
    query: 'بهترین گوشی تا ۲۰ میلیون',
    clicks: 3100,
    impressions: 48900,
    ctr: 6.34,
    position: 5.1,
    estimated_clicks_top1: Math.round(48900 * 0.28),
    growth_multiplier: Number((Math.round(48900 * 0.28) / 3100).toFixed(1)),
    cluster_tag: 'Quick Win (فرصت سریع)',
  },
  {
    id: 7,
    audit_id: 101,
    query: 'ساعت هوشمند سامسونگ گلکسی واچ ۶',
    clicks: 1420,
    impressions: 29500,
    ctr: 4.81,
    position: 6.7,
    estimated_clicks_top1: Math.round(29500 * 0.28),
    growth_multiplier: Number((Math.round(29500 * 0.28) / 1420).toFixed(1)),
    cluster_tag: 'Quick Win (فرصت سریع)',
  },
  {
    id: 8,
    audit_id: 101,
    query: 'خرید اقساطی لپ تاپ بدون ضامن',
    clicks: 4950,
    impressions: 36000,
    ctr: 13.75,
    position: 2.4,
    estimated_clicks_top1: Math.round(36000 * 0.28),
    growth_multiplier: Number((Math.round(36000 * 0.28) / 4950).toFixed(1)),
    cluster_tag: 'Transactional (تجاری/خرید)',
  },
  {
    id: 9,
    audit_id: 101,
    query: 'مقایسه s24 ultra با آیفون 15 پرومکس',
    clicks: 980,
    impressions: 27400,
    ctr: 3.58,
    position: 8.6,
    estimated_clicks_top1: Math.round(27400 * 0.28),
    growth_multiplier: Number((Math.round(27400 * 0.28) / 980).toFixed(1)),
    cluster_tag: 'Quick Win (فرصت سریع)',
  },
  {
    id: 10,
    audit_id: 101,
    query: 'پاوربانک فست شارژ شیائومی ۲۰۰۰۰',
    clicks: 1840,
    impressions: 24800,
    ctr: 7.42,
    position: 4.5,
    estimated_clicks_top1: Math.round(24800 * 0.28),
    growth_multiplier: Number((Math.round(24800 * 0.28) / 1840).toFixed(1)),
    cluster_tag: 'Quick Win (فرصت سریع)',
  },
  // Audit 201 (iranhotel-booking.com)
  {
    id: 11,
    audit_id: 201,
    query: 'رزرو هتل مشهد نزدیک حرم',
    clicks: 8400,
    impressions: 115000,
    ctr: 7.3,
    position: 4.6,
    estimated_clicks_top1: Math.round(115000 * 0.28),
    growth_multiplier: Number((Math.round(115000 * 0.28) / 8400).toFixed(1)),
    cluster_tag: 'Quick Win (فرصت سریع)',
  },
  {
    id: 12,
    audit_id: 201,
    query: 'هتل ترنج کیش قیمت',
    clicks: 5200,
    impressions: 74000,
    ctr: 7.03,
    position: 5.2,
    estimated_clicks_top1: Math.round(74000 * 0.28),
    growth_multiplier: Number((Math.round(74000 * 0.28) / 5200).toFixed(1)),
    cluster_tag: 'Quick Win (فرصت سریع)',
  },
  {
    id: 13,
    audit_id: 201,
    query: 'رزرو هتل عباسی اصفهان',
    clicks: 4100,
    impressions: 58000,
    ctr: 7.07,
    position: 4.9,
    estimated_clicks_top1: Math.round(58000 * 0.28),
    growth_multiplier: Number((Math.round(58000 * 0.28) / 4100).toFixed(1)),
    cluster_tag: 'Quick Win (فرصت سریع)',
  },
  // Audit 301 (parseh-academy.ir)
  {
    id: 14,
    audit_id: 301,
    query: 'آموزش پایتون از صفر تا بازار کار',
    clicks: 1950,
    impressions: 42000,
    ctr: 4.64,
    position: 6.8,
    estimated_clicks_top1: Math.round(42000 * 0.28),
    growth_multiplier: Number((Math.round(42000 * 0.28) / 1950).toFixed(1)),
    cluster_tag: 'Quick Win (فرصت سریع)',
  },
  {
    id: 15,
    audit_id: 301,
    query: 'دوره جامع ری اکت و Next.js',
    clicks: 1280,
    impressions: 29000,
    ctr: 4.41,
    position: 7.2,
    estimated_clicks_top1: Math.round(29000 * 0.28),
    growth_multiplier: Number((Math.round(29000 * 0.28) / 1280).toFixed(1)),
    cluster_tag: 'Quick Win (فرصت سریع)',
  },
];

export const initialTechnicalCrawlStats: TechnicalCrawlStats[] = [
  {
    id: 1,
    audit_id: 101,
    total_urls: 4820,
    indexable_urls: 3640,
    duplicate_titles: 312,
    missing_titles: 48,
    missing_descriptions: 425,
    missing_h1: 186,
    status_404_count: 94,
    status_301_count: 276,
    click_depth_distribution_json: {
      '1': 145,
      '2': 1120,
      '3': 1890,
      '4': 940,
      '5': 485,
      '6+': 240,
    },
  },
  {
    id: 2,
    audit_id: 102,
    total_urls: 4350,
    indexable_urls: 3100,
    duplicate_titles: 490,
    missing_titles: 85,
    missing_descriptions: 610,
    missing_h1: 290,
    status_404_count: 180,
    status_301_count: 420,
    click_depth_distribution_json: {
      '1': 120,
      '2': 980,
      '3': 1540,
      '4': 980,
      '5': 490,
      '6+': 240,
    },
  },
  {
    id: 3,
    audit_id: 201,
    total_urls: 6250,
    indexable_urls: 5120,
    duplicate_titles: 215,
    missing_titles: 19,
    missing_descriptions: 340,
    missing_h1: 112,
    status_404_count: 64,
    status_301_count: 195,
    click_depth_distribution_json: {
      '1': 210,
      '2': 1850,
      '3': 2640,
      '4': 990,
      '5': 380,
      '6+': 180,
    },
  },
  {
    id: 4,
    audit_id: 301,
    total_urls: 1480,
    indexable_urls: 1190,
    duplicate_titles: 142,
    missing_titles: 14,
    missing_descriptions: 198,
    missing_h1: 68,
    status_404_count: 37,
    status_301_count: 84,
    click_depth_distribution_json: {
      '1': 65,
      '2': 420,
      '3': 590,
      '4': 245,
      '5': 110,
      '6+': 50,
    },
  },
];

export const initialSpeedAndCompetitors: SpeedAndCompetitor[] = [
  // Audit 101
  {
    id: 1,
    audit_id: 101,
    domain: 'technolife-plus.ir',
    is_main_site: true,
    dr_score: 54,
    referring_domains: 1420,
    mobile_perf_score: 61,
    desktop_perf_score: 84,
    lcp_seconds: 3.15,
    inp_ms: 215,
    cls_score: 0.085,
  },
  {
    id: 2,
    audit_id: 101,
    domain: 'digikala.com',
    is_main_site: false,
    dr_score: 79,
    referring_domains: 8400,
    mobile_perf_score: 68,
    desktop_perf_score: 89,
    lcp_seconds: 2.65,
    inp_ms: 175,
    cls_score: 0.042,
  },
  {
    id: 3,
    audit_id: 101,
    domain: 'technolife.ir',
    is_main_site: false,
    dr_score: 69,
    referring_domains: 3850,
    mobile_perf_score: 72,
    desktop_perf_score: 91,
    lcp_seconds: 2.4,
    inp_ms: 160,
    cls_score: 0.031,
  },
  {
    id: 4,
    audit_id: 101,
    domain: 'mobit.ir',
    is_main_site: false,
    dr_score: 58,
    referring_domains: 1890,
    mobile_perf_score: 65,
    desktop_perf_score: 86,
    lcp_seconds: 2.85,
    inp_ms: 190,
    cls_score: 0.064,
  },
  // Audit 201
  {
    id: 5,
    audit_id: 201,
    domain: 'iranhotel-booking.com',
    is_main_site: true,
    dr_score: 62,
    referring_domains: 2350,
    mobile_perf_score: 67,
    desktop_perf_score: 88,
    lcp_seconds: 2.75,
    inp_ms: 185,
    cls_score: 0.055,
  },
  {
    id: 6,
    audit_id: 201,
    domain: 'snapptrip.com',
    is_main_site: false,
    dr_score: 74,
    referring_domains: 5120,
    mobile_perf_score: 76,
    desktop_perf_score: 93,
    lcp_seconds: 2.2,
    inp_ms: 145,
    cls_score: 0.025,
  },
  {
    id: 7,
    audit_id: 201,
    domain: 'alibaba.ir',
    is_main_site: false,
    dr_score: 77,
    referring_domains: 6890,
    mobile_perf_score: 79,
    desktop_perf_score: 95,
    lcp_seconds: 2.05,
    inp_ms: 130,
    cls_score: 0.019,
  },
  // Audit 301
  {
    id: 8,
    audit_id: 301,
    domain: 'parseh-academy.ir',
    is_main_site: true,
    dr_score: 46,
    referring_domains: 780,
    mobile_perf_score: 54,
    desktop_perf_score: 78,
    lcp_seconds: 3.65,
    inp_ms: 260,
    cls_score: 0.142,
  },
  {
    id: 9,
    audit_id: 301,
    domain: 'faradars.org',
    is_main_site: false,
    dr_score: 71,
    referring_domains: 4200,
    mobile_perf_score: 71,
    desktop_perf_score: 90,
    lcp_seconds: 2.45,
    inp_ms: 155,
    cls_score: 0.038,
  },
];

export const initialReportSections: ReportSection[] = [
  {
    id: 1,
    audit_id: 101,
    section_key: 'executive_summary',
    ai_generated_html: `<h3>خلاصه مدیریتی و پتانسیل رشد ارگانیک</h3>
<p>بررسی جامع داده‌های سرچ کنسول و خزش تکنیکال دامنه <strong>technolife-plus.ir</strong> نشان می‌دهد که سایت در حال حاضر روی ۱۰ کلمه کلیدی استراتژیک بیش از <strong>۵۰۴,۷۰۰ نمایش (Impression)</strong> ماهانه دارد اما به دلیل قرارگیری در جایگاه‌های ۴ تا ۸، تنها ۳۲,۵۵۰ کلیک دریافت می‌کند.</p>
<ul>
  <li><strong>پتانسیل ترافیک رتبه ۱ (CTR Curve 28%):</strong> در صورت ارتقای کلمات Quick Win به رتبه اول گوگل، ترافیک ماهانه این خوشه از ۳۲,۵۵۰ کلیک به <strong>۱۴۱,۳۱۶ کلیک در ماه</strong> (ضریب رشد ۴.۳ برابری) افزایش خواهد یافت.</li>
  <li><strong>مهم‌ترین گلوگاه فعلی:</strong> وجود ۱,۶۶۵ صفحه در عمق کلیک ۴ به بالا (۳۴.۵٪ کل صفحات) و زمان LCP موبایل ۳.۱۵ ثانیه مانع اصلی عبور از رقبایی مانند دیجی‌کالا و تکنولایف در نتایج موبایل است.</li>
</ul>`,
    final_edited_html: `<h3>خلاصه مدیریتی و پتانسیل رشد ارگانیک</h3>
<p>بررسی جامع داده‌های سرچ کنسول و خزش تکنیکال دامنه <strong>technolife-plus.ir</strong> نشان می‌دهد که سایت در حال حاضر روی ۱۰ کلمه کلیدی استراتژیک بیش از <strong>۵۰۴,۷۰۰ نمایش (Impression)</strong> ماهانه دارد اما به دلیل قرارگیری در جایگاه‌های ۴ تا ۸، تنها ۳۲,۵۵۰ کلیک دریافت می‌کند.</p>
<ul>
  <li><strong>پتانسیل ترافیک رتبه ۱ (CTR Curve 28%):</strong> در صورت ارتقای کلمات Quick Win به رتبه اول گوگل، ترافیک ماهانه این خوشه از ۳۲,۵۵۰ کلیک به <strong>۱۴۱,۳۱۶ کلیک در ماه</strong> (ضریب رشد ۴.۳ برابری) افزایش خواهد یافت.</li>
  <li><strong>مهم‌ترین گلوگاه فعلی:</strong> وجود ۱,۶۶۵ صفحه در عمق کلیک ۴ به بالا (۳۴.۵٪ کل صفحات) و زمان LCP موبایل ۳.۱۵ ثانیه مانع اصلی عبور از رقبایی مانند دیجی‌کالا و تکنولایف در نتایج موبایل است.</li>
</ul>`,
    updated_at: '2026-11-15T15:00:00Z',
  },
  {
    id: 2,
    audit_id: 101,
    section_key: 'technical',
    ai_generated_html: `<h3>تحلیل سئو تکنیکال و معماری خزش (Screaming Frog)</h3>
<p>از مجموع <strong>۴,۸۲۰ آدرس خزش‌شده</strong>، تعداد ۳,۶۴۰ صفحه قابل ایندکس (Indexable) و ۱,۱۸۰ صفحه غیرقابل ایندکس (شامل پارامترهای فیلتر، تگ‌های Canonicalized و ریدایرکت‌ها) هستند.</p>
<ul>
  <li><strong>بحران عمق کلیک (Click Depth > 3):</strong> بیش از ۱,۶۶۵ صفحه محصول و دسته‌بندی فرعی در عمق کلیک ۴، ۵ و ۶+ قرار دارند. ربات گوگل به صفحاتی که بیش از ۳ کلیک از صفحه اصلی فاصله دارند، بودجه خزش (Crawl Budget) و PageRank داخلی بسیار کمتری اختصاص می‌دهد.</li>
  <li><strong>مدیریت کدهای وضعیت:</strong> وجود ۹۴ خطای 404 در صفحات محصولات ناموجود قدیمی و ۲۷۶ زنجیره ریدایرکت 301 نیازمند اصلاح مستقیم در لایه روتینگ Next.js است.</li>
</ul>`,
    final_edited_html: `<h3>تحلیل سئو تکنیکال و معماری خزش (Screaming Frog)</h3>
<p>از مجموع <strong>۴,۸۲۰ آدرس خزش‌شده</strong>، تعداد ۳,۶۴۰ صفحه قابل ایندکس (Indexable) و ۱,۱۸۰ صفحه غیرقابل ایندکس (شامل پارامترهای فیلتر، تگ‌های Canonicalized و ریدایرکت‌ها) هستند.</p>
<ul>
  <li><strong>بحران عمق کلیک (Click Depth > 3):</strong> بیش از ۱,۶۶۵ صفحه محصول و دسته‌بندی فرعی در عمق کلیک ۴، ۵ و ۶+ قرار دارند. ربات گوگل به صفحاتی که بیش از ۳ کلیک از صفحه اصلی فاصله دارند، بودجه خزش (Crawl Budget) و PageRank داخلی بسیار کمتری اختصاص می‌دهد.</li>
  <li><strong>مدیریت کدهای وضعیت:</strong> وجود ۹۴ خطای 404 در صفحات محصولات ناموجود قدیمی و ۲۷۶ زنجیره ریدایرکت 301 نیازمند اصلاح مستقیم در لایه روتینگ Next.js است.</li>
</ul>`,
    updated_at: '2026-11-15T15:00:00Z',
  },
  {
    id: 3,
    audit_id: 101,
    section_key: 'keyword_pillar',
    ai_generated_html: `<h3>استراتژی کلمات کلیدی، Quick Wins و ساختار Pillar-Cluster</h3>
<p>با فیلتر کردن عبارات دارای <strong>Impression بالای ۱,۰۰۰</strong> و جایگاه بین <strong>۴ تا ۱۵</strong>، ۹ خوشه کلیدی با بازدهی فوری شناسایی شدند:</p>
<ul>
  <li><strong>خوشه قیمت و خرید موبایل سامسونگ و آیفون:</strong> عباراتی نظیر «قیمت آیفون 16 پرومکس» (۹۴,۰۰۰ نمایش، رتبه ۶.۲) و «خرید گوشی سامسونگ a55» (۶۸,۵۰۰ نمایش، رتبه ۵.۴) با بهینه‌سازی جدول مشخصات، آپدیت روزانه قیمت در Schema Markup و لینک‌سازی داخلی از مقالات مقایسه‌ای، در کمتر از ۴۵ روز به Top 3 می‌رسند.</li>
  <li><strong>خوشه راهنمای خرید (Informational -> Transactional):</strong> عبارت «بهترین گوشی تا ۲۰ میلیون» با ضریب رشد ۴.۴ برابری بهترین ورودی قیف فروش برای هدایت کاربر به صفحات دسته‌بندی است.</li>
</ul>`,
    final_edited_html: `<h3>استراتژی کلمات کلیدی، Quick Wins و ساختار Pillar-Cluster</h3>
<p>با فیلتر کردن عبارات دارای <strong>Impression بالای ۱,۰۰۰</strong> و جایگاه بین <strong>۴ تا ۱۵</strong>، ۹ خوشه کلیدی با بازدهی فوری شناسایی شدند:</p>
<ul>
  <li><strong>خوشه قیمت و خرید موبایل سامسونگ و آیفون:</strong> عباراتی نظیر «قیمت آیفون 16 پرومکس» (۹۴,۰۰۰ نمایش، رتبه ۶.۲) و «خرید گوشی سامسونگ a55» (۶۸,۵۰۰ نمایش، رتبه ۵.۴) با بهینه‌سازی جدول مشخصات، آپدیت روزانه قیمت در Schema Markup و لینک‌سازی داخلی از مقالات مقایسه‌ای، در کمتر از ۴۵ روز به Top 3 می‌رسند.</li>
  <li><strong>خوشه راهنمای خرید (Informational -> Transactional):</strong> عبارت «بهترین گوشی تا ۲۰ میلیون» با ضریب رشد ۴.۴ برابری بهترین ورودی قیف فروش برای هدایت کاربر به صفحات دسته‌بندی است.</li>
</ul>`,
    updated_at: '2026-11-15T15:00:00Z',
  },
  {
    id: 4,
    audit_id: 101,
    section_key: 'onpage',
    ai_generated_html: `<h3>آنالیز سلامت On-Page و بهینه‌سازی نرخ کلیک (CTR)</h3>
<p>بررسی تگ‌های متا و هدینگ‌ها نشان‌دهنده ۹۷۱ خطای On-Page در کل سایت است:</p>
<ul>
  <li><strong>تایتل‌های تکراری (۳۱۲ مورد) و فاقد تایتل (۴۸ مورد):</strong> اغلب به دلیل صفحه‌بندی (Pagination) دسته‌بندی‌های موبایل و لپ‌تاپ بدون الگوی داینامیک رخ داده است.</li>
  <li><strong>متا دیسکریپشن‌های خالی (۴۲۵ مورد):</strong> عدم وجود Meta Description هدفمند باعث شده گوگل متن‌های تصادفی از فوتر یا فیلترها را نمایش دهد و CTR عبارات تجاری به زیر ۶٪ کاهش یابد.</li>
  <li><strong>صفحات فاقد H1 (۱۸۶ مورد):</strong> در قالب صفحات برندها، لوگوی برند به جای تگ H1 در تگ تصویر قرار گرفته است.</li>
</ul>`,
    final_edited_html: `<h3>آنالیز سلامت On-Page و بهینه‌سازی نرخ کلیک (CTR)</h3>
<p>بررسی تگ‌های متا و هدینگ‌ها نشان‌دهنده ۹۷۱ خطای On-Page در کل سایت است:</p>
<ul>
  <li><strong>تایتل‌های تکراری (۳۱۲ مورد) و فاقد تایتل (۴۸ مورد):</strong> اغلب به دلیل صفحه‌بندی (Pagination) دسته‌بندی‌های موبایل و لپ‌تاپ بدون الگوی داینامیک رخ داده است.</li>
  <li><strong>متا دیسکریپشن‌های خالی (۴۲۵ مورد):</strong> عدم وجود Meta Description هدفمند باعث شده گوگل متن‌های تصادفی از فوتر یا فیلترها را نمایش دهد و CTR عبارات تجاری به زیر ۶٪ کاهش یابد.</li>
  <li><strong>صفحات فاقد H1 (۱۸۶ مورد):</strong> در قالب صفحات برندها، لوگوی برند به جای تگ H1 در تگ تصویر قرار گرفته است.</li>
</ul>`,
    updated_at: '2026-11-15T15:00:00Z',
  },
  {
    id: 5,
    audit_id: 101,
    section_key: 'offpage_competitors',
    ai_generated_html: `<h3>تحلیل رقبا، اعتبار دامنه (DR) و استراتژی Off-Page</h3>
<p>در مقایسه راداری با سه رقیب اصلی، دامنه <strong>technolife-plus.ir</strong> دارای <strong>DR 54</strong> و <strong>۱,۴۲۰ دامنه ارجاع‌دهنده (Referring Domains)</strong> است، در حالی که میانگین رقبا DR 68.6 و ۴,۷۱۳ دامنه ارجاع‌دهنده است.</p>
<ul>
  <li><strong>شکاف لینک‌سازی (Link Gap):</strong> تمرکز رپورتاژهای فعلی تنها روی صفحه اصلی بوده است؛ لازم است ۶۵٪ بودجه لینک‌سازی فصل آینده به صفحات دسته‌بندی Pillar (گوشی سامسونگ، آیفون، لپ‌تاپ ایسوس) و مقالات مقایسه‌ای اختصاص یابد.</li>
  <li><strong>انکرتکست‌های برند و ترکیبی:</strong> نسبت انکرتکست‌های Exact Match بالاست و باید با انکرتکست‌های طبیعی و Branded متوازن شود.</li>
</ul>`,
    final_edited_html: `<h3>تحلیل رقبا، اعتبار دامنه (DR) و استراتژی Off-Page</h3>
<p>در مقایسه راداری با سه رقیب اصلی، دامنه <strong>technolife-plus.ir</strong> دارای <strong>DR 54</strong> و <strong>۱,۴۲۰ دامنه ارجاع‌دهنده (Referring Domains)</strong> است، در حالی که میانگین رقبا DR 68.6 و ۴,۷۱۳ دامنه ارجاع‌دهنده است.</p>
<ul>
  <li><strong>شکاف لینک‌سازی (Link Gap):</strong> تمرکز رپورتاژهای فعلی تنها روی صفحه اصلی بوده است؛ لازم است ۶۵٪ بودجه لینک‌سازی فصل آینده به صفحات دسته‌بندی Pillar (گوشی سامسونگ، آیفون، لپ‌تاپ ایسوس) و مقالات مقایسه‌ای اختصاص یابد.</li>
  <li><strong>انکرتکست‌های برند و ترکیبی:</strong> نسبت انکرتکست‌های Exact Match بالاست و باید با انکرتکست‌های طبیعی و Branded متوازن شود.</li>
</ul>`,
    updated_at: '2026-11-15T15:00:00Z',
  },
  {
    id: 6,
    audit_id: 101,
    section_key: 'speed_cwv',
    ai_generated_html: `<h3>تحلیل سرعت و Core Web Vitals (PageSpeed Insights API)</h3>
<p>امتیاز Performance موبایل سایت <strong>۶۱ از ۱۰۰</strong> و دسکتاپ <strong>۸۴ از ۱۰۰</strong> است که در موبایل حدود ۱۰ امتیاز پایین‌تر از تکنولایف (۷۲) و دیجی‌کالا (۶۸) قرار دارد:</p>
<ul>
  <li><strong>LCP (۳.۱۵ ثانیه - نیازمند بهبود):</strong> تصاویر اسلایدر بالای صفحه و گالری محصول بدون اتریبیوت <code>fetchpriority="high"</code> و فرمت AVIF/WebP لود می‌شوند. هدف: کاهش به زیر ۲.۴ ثانیه.</li>
  <li><strong>INP (۲۱۵ میلی‌ثانیه - مرزی):</strong> اجرای اسکریپت‌های ترکینگ و چت آنلاین در Main Thread باعث تاخیر در تعامل فیلترهای لیست محصول در موبایل شده است.</li>
  <li><strong>CLS (۰.۰۸۵ - قابل قبول):</strong> با تعیین ابعاد صریح برای بنرهای تبلیغاتی بالای هدر، به زیر ۰.۰۳ خواهد رسید.</li>
</ul>`,
    final_edited_html: `<h3>تحلیل سرعت و Core Web Vitals (PageSpeed Insights API)</h3>
<p>امتیاز Performance موبایل سایت <strong>۶۱ از ۱۰۰</strong> و دسکتاپ <strong>۸۴ از ۱۰۰</strong> است که در موبایل حدود ۱۰ امتیاز پایین‌تر از تکنولایف (۷۲) و دیجی‌کالا (۶۸) قرار دارد:</p>
<ul>
  <li><strong>LCP (۳.۱۵ ثانیه - نیازمند بهبود):</strong> تصاویر اسلایدر بالای صفحه و گالری محصول بدون اتریبیوت <code>fetchpriority="high"</code> و فرمت AVIF/WebP لود می‌شوند. هدف: کاهش به زیر ۲.۴ ثانیه.</li>
  <li><strong>INP (۲۱۵ میلی‌ثانیه - مرزی):</strong> اجرای اسکریپت‌های ترکینگ و چت آنلاین در Main Thread باعث تاخیر در تعامل فیلترهای لیست محصول در موبایل شده است.</li>
  <li><strong>CLS (۰.۰۸۵ - قابل قبول):</strong> با تعیین ابعاد صریح برای بنرهای تبلیغاتی بالای هدر، به زیر ۰.۰۳ خواهد رسید.</li>
</ul>`,
    updated_at: '2026-11-15T15:00:00Z',
  },
];

export const initialActionPlans: ActionPlanItem[] = [
  {
    id: 1,
    audit_id: 101,
    task_title: 'کاهش عمق کلیک ۱,۶۶۵ صفحه محصول از عمق ۴+ به عمق ۲ و ۳ از طریق مگامنوی HTML و باکس محصولات مرتبط هوشمند',
    category: 'سئو تکنیکال و معماری سایت',
    priority: 'high',
    impact_score: 10,
    assigned_team: 'technical',
    is_completed: false,
  },
  {
    id: 2,
    audit_id: 101,
    task_title: 'بهینه‌سازی محتوا، Schema Product و لینک‌سازی داخلی برای ۹ کلمه کلیدی Quick Win (جایگاه ۴ تا ۸ با Impression بالای ۲۵ هزار)',
    category: 'استراتژی کلمات کلیدی',
    priority: 'high',
    impact_score: 10,
    assigned_team: 'seo',
    is_completed: false,
  },
  {
    id: 3,
    audit_id: 101,
    task_title: 'کاهش LCP موبایل از ۳.۱۵ ثانیه به زیر ۲.۳ ثانیه با Preload تصویر اصلی محصول و سرو فرمت AVIF در Next/Image',
    category: 'Core Web Vitals',
    priority: 'high',
    impact_score: 9,
    assigned_team: 'technical',
    is_completed: false,
  },
  {
    id: 4,
    audit_id: 101,
    task_title: 'رفع ۳۱۲ تایتل تکراری و ۴۲۵ متا دیسکریپشن خالی با پیاده‌سازی الگوی داینامیک CTR-Driven (همراه با قیمت روز و گارانتی)',
    category: 'سئو On-Page',
    priority: 'high',
    impact_score: 9,
    assigned_team: 'content',
    is_completed: true,
  },
  {
    id: 5,
    audit_id: 101,
    task_title: 'افزودن تگ H1 استاندارد به ۱۸۶ صفحه آرشیو برند و اصلاح سلسله‌مراتب H2/H3 در صفحات دسته‌بندی موبایل',
    category: 'سئو On-Page',
    priority: 'medium',
    impact_score: 8,
    assigned_team: 'ui_ux',
    is_completed: true,
  },
  {
    id: 6,
    audit_id: 101,
    task_title: 'تغییر تارگت ۲۷۶ زنجیره ریدایرکت 301 به مقصد نهایی و مدیریت ۹۴ خطای 404 با ریدایرکت به دسته‌بندی والد',
    category: 'سئو تکنیکال و خزش',
    priority: 'medium',
    impact_score: 8,
    assigned_team: 'technical',
    is_completed: false,
  },
  {
    id: 7,
    audit_id: 101,
    task_title: 'تدوین و انتشار ۱۲ مقاله مقایسه‌ای عمیق (مانند مقایسه S24 Ultra با آیفون 15 پرومکس) با جدول مقایسه تعاملی',
    category: 'بازاریابی محتوایی',
    priority: 'medium',
    impact_score: 8,
    assigned_team: 'content',
    is_completed: false,
  },
  {
    id: 8,
    audit_id: 101,
    task_title: 'اجرای کمپین لینک‌سازی خارجی هدفمند (۲۵ دامنه با DR > 50) روی صفحات دسته‌بندی گوشی سامسونگ، آیفون و لپ‌تاپ ایسوس',
    category: 'سئو Off-Page و رقبا',
    priority: 'high',
    impact_score: 9,
    assigned_team: 'seo',
    is_completed: false,
  },
  {
    id: 9,
    audit_id: 101,
    task_title: 'بهبود INP موبایل به زیر ۱۵۰ میلی‌ثانیه با انتقال اسکریپت‌های چت و آنالیتیکس به Web Worker (Partytown)',
    category: 'Core Web Vitals',
    priority: 'low',
    impact_score: 7,
    assigned_team: 'technical',
    is_completed: false,
  },
];
