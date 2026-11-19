<?php
declare(strict_types=1);

namespace SeoAuditSaaS\Services;

use PDO;
use RuntimeException;

/**
 * پارسر جریانی (Stream-based) فایل‌های CSV سرچ کنسول (Queries.csv) و اسکریمینگ فراگ (internal_all.csv)
 * بدون مصرف حافظه اضافی در هاست‌های اشتراکی
 */
final class CsvParser
{
    private const CTR_TARGET_TOP1 = 0.28;

    public function __construct(private readonly PDO $pdo) {}

    /**
     * الف) پردازش فایل Queries.csv سرچ کنسول گوگل و محاسبه پتانسیل کلیک رتبه ۱ و Quick Wins
     */
    public function parseGscQueriesCsv(int $auditId, string $filePath, int $minImpressions = 50): array
    {
        if (!is_readable($filePath)) {
            throw new RuntimeException('فایل CSV سرچ کنسول قابل خواندن نیست.');
        }

        $handle = fopen($filePath, 'rb');
        if ($handle === false) {
            throw new RuntimeException('امکان باز کردن فایل CSV سرچ کنسول وجود ندارد.');
        }

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            throw new RuntimeException('فایل CSV سرچ کنسول خالی یا نامعتبر است.');
        }

        // حذف BOM احتمالی از ستون اول
        $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string)$header[0]);
        $colMap = $this->mapColumns($header, [
            'query'       => ['top queries', 'query', 'queries', 'عبارت جستجو', 'کلمه کلیدی'],
            'clicks'      => ['clicks', 'کلیک'],
            'impressions' => ['impressions', 'نمایش'],
            'ctr'         => ['ctr', 'نرخ کلیک'],
            'position'    => ['position', 'جایگاه'],
        ]);

        $rows = [];
        while (($data = fgetcsv($handle)) !== false) {
            if (count($data) < 4) {
                continue;
            }

            $query = trim((string)($data[$colMap['query']] ?? ''));
            if ($query === '') {
                continue;
            }

            $clicks = (int)preg_replace('/[^\d]/', '', (string)($data[$colMap['clicks']] ?? '0'));
            $impressions = (int)preg_replace('/[^\d]/', '', (string)($data[$colMap['impressions']] ?? '0'));

            if ($impressions < $minImpressions) {
                continue;
            }

            $rawCtr = str_replace(['%', ','], ['', '.'], (string)($data[$colMap['ctr']] ?? '0'));
            $ctr = round((float)$rawCtr, 2);
            if ($ctr === 0.0 && $impressions > 0) {
                $ctr = round(($clicks / $impressions) * 100, 2);
            }

            $position = round((float)str_replace(',', '.', (string)($data[$colMap['position']] ?? '0')), 2);

            // فرمول استاندارد نرخ کلیک هدف رتبه ۱ (۲۸٪ از کل Impressions)
            $estimatedClicksTop1 = (int)round($impressions * self::CTR_TARGET_TOP1);

            // فرمول ضریب رشد (Growth Multiplier)
            $growthMultiplier = ($clicks > 0)
                ? round($estimatedClicksTop1 / $clicks, 1)
                : (float)$estimatedClicksTop1;

            // تشخیص Quick Wins (کلمات با Impressions > 1000 و جایگاه بین ۴ تا ۱۵)
            $isQuickWin = ($impressions > 1000 && $position >= 4.0 && $position <= 15.0);
            $clusterTag = $isQuickWin ? 'Quick Win (فرصت سریع)' : $this->detectClusterTag($query, $position);

            $rows[] = [
                'query'                 => $query,
                'clicks'                => $clicks,
                'impressions'           => $impressions,
                'ctr'                   => $ctr,
                'position'              => $position,
                'estimated_clicks_top1' => $estimatedClicksTop1,
                'growth_multiplier'     => min($growthMultiplier, 9999.9),
                'cluster_tag'           => $clusterTag,
            ];
        }
        fclose($handle);

        // مرتب‌سازی بر اساس بیشترین Impression
        usort($rows, static fn(array $a, array $b): int => $b['impressions'] <=> $a['impressions']);
        $topRows = array_slice($rows, 0, 200);

        // ذخیره در جدول gsc_keywords
        $this->pdo->prepare('DELETE FROM gsc_keywords WHERE audit_id = :audit_id')
            ->execute(['audit_id' => $auditId]);

        $stmt = $this->pdo->prepare(
            'INSERT INTO gsc_keywords
            (audit_id, query, clicks, impressions, ctr, position, estimated_clicks_top1, growth_multiplier, cluster_tag)
            VALUES (:audit_id, :query, :clicks, :impressions, :ctr, :position, :est, :growth, :cluster)'
        );

        foreach ($topRows as $row) {
            $stmt->execute([
                'audit_id'    => $auditId,
                'query'       => $row['query'],
                'clicks'      => $row['clicks'],
                'impressions' => $row['impressions'],
                'ctr'         => $row['ctr'],
                'position'    => $row['position'],
                'est'         => $row['estimated_clicks_top1'],
                'growth'      => $row['growth_multiplier'],
                'cluster'     => $row['cluster_tag'],
            ]);
        }

        return [
            'inserted_count'   => count($topRows),
            'quick_wins_count' => count(array_filter($topRows, static fn($r) => str_contains($r['cluster_tag'], 'Quick Win'))),
            'top_keywords'     => array_slice($topRows, 0, 15),
        ];
    }

    /**
     * ب) پردازش جریانی (Stream) فایل Screaming Frog (internal_all.csv) بدون ذخیره سطرها در دیتابیس
     */
    public function parseScreamingFrogCsv(int $auditId, string $filePath): array
    {
        if (!is_readable($filePath)) {
            throw new RuntimeException('فایل Screaming Frog قابل خواندن نیست.');
        }

        $handle = fopen($filePath, 'rb');
        if ($handle === false) {
            throw new RuntimeException('امکان باز کردن فایل Screaming Frog وجود ندارد.');
        }

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            throw new RuntimeException('فایل CSV اسکریمینگ فراگ خالی است.');
        }

        $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string)$header[0]);
        $colMap = $this->mapColumns($header, [
            'status_code'  => ['status code', 'status'],
            'indexability' => ['indexability'],
            'title'        => ['title 1', 'title'],
            'description'  => ['meta description 1', 'meta description'],
            'h1'           => ['h1-1', 'h1'],
            'crawl_depth'  => ['crawl depth', 'click depth'],
        ]);

        $totalUrls = 0;
        $indexableUrls = 0;
        $missingTitles = 0;
        $missingDescriptions = 0;
        $missingH1 = 0;
        $status404Count = 0;
        $status301Count = 0;
        $titleOccurrences = [];
        $depthDistribution = [
            '1'  => 0,
            '2'  => 0,
            '3'  => 0,
            '4'  => 0,
            '5'  => 0,
            '6+' => 0,
        ];

        while (($data = fgetcsv($handle)) !== false) {
            if (count($data) < 2) {
                continue;
            }
            $totalUrls++;

            $statusCode = (int)($data[$colMap['status_code']] ?? 200);
            $indexability = strtolower(trim((string)($data[$colMap['indexability']] ?? 'indexable')));
            $title = trim((string)($data[$colMap['title']] ?? ''));
            $description = trim((string)($data[$colMap['description']] ?? ''));
            $h1 = trim((string)($data[$colMap['h1']] ?? ''));
            $depthRaw = trim((string)($data[$colMap['crawl_depth']] ?? '1'));

            if ($statusCode === 404) {
                $status404Count++;
            } elseif ($statusCode === 301 || $statusCode === 302) {
                $status301Count++;
            }

            if ($indexability === 'indexable') {
                $indexableUrls++;
            }

            if ($title === '') {
                $missingTitles++;
            } else {
                $normalizedTitle = mb_strtolower($title, 'UTF-8');
                $titleOccurrences[$normalizedTitle] = ($titleOccurrences[$normalizedTitle] ?? 0) + 1;
            }

            if ($description === '') {
                $missingDescriptions++;
            }

            if ($h1 === '') {
                $missingH1++;
            }

            if (is_numeric($depthRaw)) {
                $depth = (int)$depthRaw;
                if ($depth <= 1) {
                    $depthDistribution['1']++;
                } elseif ($depth === 2) {
                    $depthDistribution['2']++;
                } elseif ($depth === 3) {
                    $depthDistribution['3']++;
                } elseif ($depth === 4) {
                    $depthDistribution['4']++;
                } elseif ($depth === 5) {
                    $depthDistribution['5']++;
                } else {
                    $depthDistribution['6+']++;
                }
            }
        }
        fclose($handle);

        // محاسبه تعداد کل صفحات دارای Title تکراری
        $duplicateTitles = 0;
        foreach ($titleOccurrences as $count) {
            if ($count > 1) {
                $duplicateTitles += $count;
            }
        }

        $depthJson = json_encode($depthDistribution, JSON_UNESCAPED_UNICODE);

        $stmt = $this->pdo->prepare(
            'INSERT INTO technical_crawl_stats
            (audit_id, total_urls, indexable_urls, duplicate_titles, missing_titles, missing_descriptions, missing_h1, status_404_count, status_301_count, click_depth_distribution_json)
            VALUES (:audit_id, :total, :indexable, :dup_titles, :miss_titles, :miss_desc, :miss_h1, :s404, :s301, :depth_json)
            ON DUPLICATE KEY UPDATE
                total_urls = VALUES(total_urls),
                indexable_urls = VALUES(indexable_urls),
                duplicate_titles = VALUES(duplicate_titles),
                missing_titles = VALUES(missing_titles),
                missing_descriptions = VALUES(missing_descriptions),
                missing_h1 = VALUES(missing_h1),
                status_404_count = VALUES(status_404_count),
                status_301_count = VALUES(status_301_count),
                click_depth_distribution_json = VALUES(click_depth_distribution_json)'
        );

        $stmt->execute([
            'audit_id'    => $auditId,
            'total'       => $totalUrls,
            'indexable'   => $indexableUrls,
            'dup_titles'  => $duplicateTitles,
            'miss_titles' => $missingTitles,
            'miss_desc'   => $missingDescriptions,
            'miss_h1'     => $missingH1,
            's404'        => $status404Count,
            's301'        => $status301Count,
            'depth_json'  => $depthJson,
        ]);

        return [
            'total_urls'                    => $totalUrls,
            'indexable_urls'                => $indexableUrls,
            'duplicate_titles'              => $duplicateTitles,
            'missing_titles'                => $missingTitles,
            'missing_descriptions'          => $missingDescriptions,
            'missing_h1'                    => $missingH1,
            'status_404_count'              => $status404Count,
            'status_301_count'              => $status301Count,
            'click_depth_distribution_json' => $depthDistribution,
        ];
    }

    private function mapColumns(array $header, array $candidates): array
    {
        $normalizedHeader = array_map(
            static fn($h) => strtolower(trim((string)$h)),
            $header
        );

        $result = [];
        foreach ($candidates as $key => $aliases) {
            $result[$key] = 0;
            foreach ($aliases as $alias) {
                $index = array_search(strtolower($alias), $normalizedHeader, true);
                if ($index !== false) {
                    $result[$key] = (int)$index;
                    break;
                }
            }
        }
        return $result;
    }

    private function detectClusterTag(string $query, float $position): string
    {
        if (preg_match('/(خرید|قیمت|فروش|سفارش|ارزان|لیست قیمت)/u', $query)) {
            return 'Transactional (تجاری/خرید)';
        }
        if (preg_match('/(چیست|آموزش|راهنما|نحوه|بهترین|مقایسه)/u', $query)) {
            return 'Informational (محتوایی/آموزشی)';
        }
        if ($position <= 3.5) {
            return 'Brand / Dominant (رتبه برتر)';
        }
        return 'Core Pillar (کلمه کلیدی اصلی)';
    }
}
