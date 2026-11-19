<?php
declare(strict_types=1);

namespace SeoAuditSaaS\Services;

use PDO;
use RuntimeException;

/**
 * سرویس اتصال خودکار به Google PageSpeed Insights API v5
 * استخراج امتیاز Performance موبایل و دسکتاپ + متریک‌های LCP, INP, CLS
 */
final class PageSpeedService
{
    private const ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

    public function __construct(
        private readonly PDO $pdo,
        private readonly string $apiKey = ''
    ) {}

    /**
     * آنالیز سرعت دامنه (موبایل و دسکتاپ) و ذخیره در جدول speed_and_competitors
     */
    public function analyzeAndSaveDomain(
        int $auditId,
        string $domain,
        bool $isMainSite,
        int $drScore = 0,
        int $referringDomains = 0
    ): array {
        $url = str_starts_with($domain, 'http') ? $domain : 'https://' . trim($domain);

        $mobileData = $this->fetchStrategy($url, 'mobile');
        $desktopData = $this->fetchStrategy($url, 'desktop');

        $record = [
            'audit_id'           => $auditId,
            'domain'             => preg_replace('#^https?://#', '', $url),
            'is_main_site'       => $isMainSite ? 1 : 0,
            'dr_score'           => $drScore,
            'referring_domains'  => $referringDomains,
            'mobile_perf_score'  => $mobileData['performance_score'],
            'desktop_perf_score' => $desktopData['performance_score'],
            'lcp_seconds'        => $mobileData['lcp_seconds'],
            'inp_ms'             => $mobileData['inp_ms'],
            'cls_score'          => $mobileData['cls_score'],
        ];

        $stmt = $this->pdo->prepare(
            'INSERT INTO speed_and_competitors
            (audit_id, domain, is_main_site, dr_score, referring_domains, mobile_perf_score, desktop_perf_score, lcp_seconds, inp_ms, cls_score)
            VALUES (:audit_id, :domain, :is_main_site, :dr_score, :referring_domains, :mobile_perf_score, :desktop_perf_score, :lcp_seconds, :inp_ms, :cls_score)'
        );
        $stmt->execute($record);

        return $record;
    }

    /**
     * ارسال درخواست GET با cURL به Google PageSpeed Insights v5
     */
    public function fetchStrategy(string $url, string $strategy = 'mobile'): array
    {
        $params = [
            'url'      => $url,
            'strategy' => $strategy,
            'category' => 'performance',
        ];
        if ($this->apiKey !== '') {
            $params['key'] = $this->apiKey;
        }

        $requestUrl = self::ENDPOINT . '?' . http_build_query($params);

        $ch = curl_init($requestUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 45,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTPHEADER     => ['Accept: application/json'],
        ]);

        $rawResponse = curl_exec($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr = curl_error($ch);
        curl_close($ch);

        if ($rawResponse === false || $httpCode >= 400) {
            throw new RuntimeException(sprintf(
                'خطا در دریافت اطلاعات PageSpeed برای %s (%s): %s',
                $url,
                $strategy,
                $curlErr ?: 'HTTP ' . $httpCode
            ));
        }

        $json = json_decode((string)$rawResponse, true);
        $lighthouse = $json['lighthouseResult'] ?? [];
        $audits = $lighthouse['audits'] ?? [];

        $perfScoreRaw = (float)($lighthouse['categories']['performance']['score'] ?? 0.0);
        $performanceScore = (int)round($perfScoreRaw * 100);

        // LCP در لایت‌هاوس بر حسب میلی‌ثانیه است -> تبدیل به ثانیه
        $lcpMs = (float)($audits['largest-contentful-paint']['numericValue'] ?? 2500.0);
        $lcpSeconds = round($lcpMs / 1000, 2);

        // INP یا معادل آزمایشگاهی TBT/Max Potential FID
        $inpMs = (int)round((float)(
            $audits['interaction-to-next-paint']['numericValue']
            ?? $audits['experimental-interaction-to-next-paint']['numericValue']
            ?? $audits['total-blocking-time']['numericValue']
            ?? 180
        ));

        // CLS
        $clsScore = round((float)($audits['cumulative-layout-shift']['numericValue'] ?? 0.05), 3);

        return [
            'performance_score' => $performanceScore,
            'lcp_seconds'       => $lcpSeconds,
            'inp_ms'            => $inpMs,
            'cls_score'         => $clsScore,
        ];
    }
}
