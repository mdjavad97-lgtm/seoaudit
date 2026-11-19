<?php
declare(strict_types=1);

namespace SeoAuditSaaS\Services;

use PDO;
use RuntimeException;

/**
 * موتور تحلیل هوش مصنوعی (AIReportGenerator / GeminiService)
 * جمع‌آوری آمارهای پردازش‌شده در قالب JSON سبک و ارسال به Gemini API برای تولید ۶ بخش تحلیلی و نقشه راه اجرایی
 */
final class AIReportGenerator
{
    private const GEMINI_MODEL = 'gemini-2.5-flash';

    public function __construct(
        private readonly PDO $pdo,
        private readonly string $geminiApiKey
    ) {}

    /**
     * جمع‌آوری داده‌های Audit، فراخوانی Gemini API و ذخیره در report_sections و action_plans
     */
    public function generateFullAuditReport(int $auditId): array
    {
        $payload = $this->buildStructuredAuditPayload($auditId);
        $prompt = $this->buildSystemPrompt($payload);
        $aiResponse = $this->callGeminiApi($prompt);

        // ۱. ذخیره ۶ بخش تحلیلی در جدول report_sections
        $sectionKeys = [
            'executive_summary',
            'technical',
            'keyword_pillar',
            'onpage',
            'offpage_competitors',
            'speed_cwv',
        ];

        $stmtSection = $this->pdo->prepare(
            'INSERT INTO report_sections (audit_id, section_key, ai_generated_html, final_edited_html)
             VALUES (:audit_id, :section_key, :ai_html, :final_html)
             ON DUPLICATE KEY UPDATE
                ai_generated_html = VALUES(ai_generated_html),
                final_edited_html = VALUES(final_edited_html)'
        );

        foreach ($sectionKeys as $key) {
            $html = (string)($aiResponse[$key] ?? '<p>تحلیلی برای این بخش ثبت نشد.</p>');
            $stmtSection->execute([
                'audit_id'    => $auditId,
                'section_key' => $key,
                'ai_html'     => $html,
                'final_html'  => $html,
            ]);
        }

        // ۲. ذخیره تسک‌های اولویت‌بندی‌شده در جدول action_plans
        if (!empty($aiResponse['action_plans']) && is_array($aiResponse['action_plans'])) {
            $this->pdo->prepare('DELETE FROM action_plans WHERE audit_id = :audit_id')
                ->execute(['audit_id' => $auditId]);

            $stmtPlan = $this->pdo->prepare(
                'INSERT INTO action_plans
                (audit_id, task_title, category, priority, impact_score, assigned_team, is_completed)
                VALUES (:audit_id, :task_title, :category, :priority, :impact_score, :assigned_team, 0)'
            );

            foreach ($aiResponse['action_plans'] as $plan) {
                $priority = in_array($plan['priority'] ?? '', ['high', 'medium', 'low'], true)
                    ? $plan['priority']
                    : 'medium';
                $team = in_array($plan['assigned_team'] ?? '', ['technical', 'content', 'seo', 'ui_ux'], true)
                    ? $plan['assigned_team']
                    : 'seo';
                $impact = max(1, min(10, (int)($plan['impact_score'] ?? 7)));

                $stmtPlan->execute([
                    'audit_id'      => $auditId,
                    'task_title'    => (string)($plan['task_title'] ?? 'اقدام اصلاحی سئو'),
                    'category'      => (string)($plan['category'] ?? 'Technical SEO'),
                    'priority'      => $priority,
                    'impact_score'  => $impact,
                    'assigned_team' => $team,
                ]);
            }
        }

        return $aiResponse;
    }

    /**
     * ساخت JSON سبک و ساختاریافته از داده‌های MySQL برای ارسال به هوش مصنوعی
     */
    public function buildStructuredAuditPayload(int $auditId): array
    {
        $stmtAudit = $this->pdo->prepare(
            'SELECT a.id, a.title, a.audit_date, p.domain, p.client_name, p.cms_type, p.industry, p.competitors_json
             FROM audits a
             INNER JOIN projects p ON p.id = a.project_id
             WHERE a.id = :id'
        );
        $stmtAudit->execute(['id' => $auditId]);
        $audit = $stmtAudit->fetch();

        if (!$audit) {
            throw new RuntimeException('گزارش مورد نظر در دیتابیس یافت نشد.');
        }

        $stmtKeywords = $this->pdo->prepare(
            'SELECT query, clicks, impressions, ctr, position, estimated_clicks_top1, growth_multiplier, cluster_tag
             FROM gsc_keywords
             WHERE audit_id = :audit_id
             ORDER BY impressions DESC
             LIMIT 15'
        );
        $stmtKeywords->execute(['audit_id' => $auditId]);

        $stmtTech = $this->pdo->prepare(
            'SELECT total_urls, indexable_urls, duplicate_titles, missing_titles, missing_descriptions,
                    missing_h1, status_404_count, status_301_count, click_depth_distribution_json
             FROM technical_crawl_stats
             WHERE audit_id = :audit_id'
        );
        $stmtTech->execute(['audit_id' => $auditId]);

        $stmtSpeed = $this->pdo->prepare(
            'SELECT domain, is_main_site, dr_score, referring_domains, mobile_perf_score,
                    desktop_perf_score, lcp_seconds, inp_ms, cls_score
             FROM speed_and_competitors
             WHERE audit_id = :audit_id
             ORDER BY is_main_site DESC'
        );
        $stmtSpeed->execute(['audit_id' => $auditId]);

        return [
            'project' => [
                'domain'      => $audit['domain'],
                'client_name' => $audit['client_name'],
                'cms_type'    => $audit['cms_type'],
                'industry'    => $audit['industry'],
                'audit_date'  => $audit['audit_date'],
            ],
            'gsc_top_keywords'       => $stmtKeywords->fetchAll(),
            'technical_crawl_stats'  => $stmtTech->fetch() ?: [],
            'speed_and_competitors'  => $stmtSpeed->fetchAll(),
        ];
    }

    private function buildSystemPrompt(array $payload): string
    {
        $jsonPayload = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        return <<<PROMPT
تو یک استراتژیست ارشد سئو (Senior Technical & Strategic SEO Consultant) هستی. بر اساس داده‌های واقعی زیر از سرچ کنسول، اسکریمینگ فراگ و PageSpeed Insights، یک گزارش تحلیلی جامع و اجرایی به زبان فارسی رسمی و تخصصی تولید کن.

داده‌های ورودی پروژه (JSON):
{$jsonPayload}

خروجی را دقیقاً در قالب یک آبجکت JSON معتبر با کلیدهای زیر برگردان:
1. "executive_summary": متن HTML شامل خلاصه مدیریتی، وضعیت فعلی، پتانسیل رشد کلیک در صورت رسیدن به رتبه ۱ و مهم‌ترین گلوگاه‌های سایت.
2. "technical": متن HTML تحلیل فنی وضعیت ایندکس، کدهای وضعیت 404/301 و توزیع عمق کلیک (Click Depth) با راهکارهای متناسب با CMS سایت.
3. "keyword_pillar": متن HTML تحلیل استراتژی کلمات کلیدی، فرصت‌های سریع (Quick Wins) و خوشه‌بندی موضوعی (Topic Clusters).
4. "onpage": متن HTML تحلیل سلامت تگ‌های Title، Meta Description و H1 و بهینه‌سازی نرخ کلیک (CTR).
5. "offpage_competitors": متن HTML تحلیل شکاف اعتبار دامنه (DR) و تعداد Referring Domains نسبت به رقبا و استراتژی لینک‌سازی.
6. "speed_cwv": متن HTML تحلیل Core Web Vitals (LCP, INP, CLS) در موبایل و دسکتاپ نسبت به رقبا.
7. "action_plans": آرایه‌ای از ۸ تا ۱۲ تسک اجرایی که هر آیتم شامل کلیدهای زیر باشد:
   - "task_title": عنوان دقیق اقدام اجرایی به فارسی
   - "category": دسته‌بندی (مثلاً "سئو تکنیکال"، "بهینه‌سازی محتوا"، "Core Web Vitals"، "لینک‌سازی")
   - "priority": یکی از مقادیر "high" | "medium" | "low"
   - "impact_score": عدد صحیح بین 1 تا 10
   - "assigned_team": یکی از مقادیر "technical" | "content" | "seo" | "ui_ux"
PROMPT;
    }

    private function callGeminiApi(string $prompt): array
    {
        $endpoint = sprintf(
            'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s',
            self::GEMINI_MODEL,
            urlencode($this->geminiApiKey)
        );

        $requestBody = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                    ],
                ],
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
            ],
        ];

        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($requestBody, JSON_UNESCAPED_UNICODE),
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT        => 60,
        ]);

        $response = curl_exec($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false || $httpCode >= 400) {
            throw new RuntimeException('خطا در ارتباط با Gemini API: ' . ($curlError ?: 'HTTP ' . $httpCode));
        }

        $decoded = json_decode((string)$response, true);
        $rawText = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
        $parsed = json_decode($rawText, true);

        if (!is_array($parsed)) {
            throw new RuntimeException('پاسخ دریافتی از هوش مصنوعی ساختار JSON معتبری ندارد.');
        }

        return $parsed;
    }
}
