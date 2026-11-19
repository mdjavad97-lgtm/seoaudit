<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/CsvParser.php';
require_once __DIR__ . '/../src/PageSpeedService.php';
require_once __DIR__ . '/../src/GeminiService.php';

use SeoAuditSaaS\Core\Database;
use SeoAuditSaaS\Services\CsvParser;
use SeoAuditSaaS\Services\PageSpeedService;
use SeoAuditSaaS\Services\AIReportGenerator;

session_start();
$pdo = Database::getConnection();
$action = $_GET['action'] ?? 'dashboard';
$auditId = (int)($_GET['audit_id'] ?? 1);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'upload_csv') {
        $parser = new CsvParser($pdo);
        if (!empty($_FILES['gsc_csv']['tmp_name'])) {
            $parser->parseGscQueriesCsv($auditId, $_FILES['gsc_csv']['tmp_name']);
        }
        if (!empty($_FILES['sf_csv']['tmp_name'])) {
            $parser->parseScreamingFrogCsv($auditId, $_FILES['sf_csv']['tmp_name']);
        }
        header("Location: ?action=editor&audit_id={$auditId}&status=uploaded");
        exit;
    }

    if ($action === 'run_pagespeed') {
        $ps = new PageSpeedService($pdo, $_ENV['PAGESPEED_API_KEY'] ?? '');
        $domain = trim((string)($_POST['domain'] ?? ''));
        $isMain = (bool)($_POST['is_main_site'] ?? false);
        $dr = (int)($_POST['dr_score'] ?? 50);
        $ref = (int)($_POST['referring_domains'] ?? 450);
        if ($domain !== '') {
            $ps->analyzeAndSaveDomain($auditId, $domain, $isMain, $dr, $ref);
        }
        header("Location: ?action=editor&audit_id={$auditId}&status=pagespeed_done");
        exit;
    }

    if ($action === 'generate_ai') {
        $ai = new AIReportGenerator($pdo, $_ENV['GEMINI_API_KEY'] ?? '');
        $ai->generateFullAuditReport($auditId);
        header("Location: ?action=editor&audit_id={$auditId}&status=ai_generated");
        exit;
    }

    if ($action === 'save_section') {
        $sectionKey = (string)($_POST['section_key'] ?? '');
        $html = (string)($_POST['final_edited_html'] ?? '');
        $stmt = $pdo->prepare(
            'UPDATE report_sections SET final_edited_html = :html WHERE audit_id = :audit_id AND section_key = :key'
        );
        $stmt->execute(['html' => $html, 'audit_id' => $auditId, 'key' => $sectionKey]);
        header("Location: ?action=editor&audit_id={$auditId}&status=saved");
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>پلتفرم تولید گزارش آنالیز و استراتژی سئو</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.ckeditor.com/ckeditor5/41.1.0/classic/ckeditor.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Vazirmatn', sans-serif; }
        @media print {
            @page { size: A4 portrait; margin: 14mm; }
            .no-print { display: none !important; }
            table, canvas, .avoid-break { page-break-inside: avoid !important; break-inside: avoid !important; }
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-900">
    <!-- کامل‌ترین نسخه تعاملی این رابط کاربری در اپلیکیشن وب فعال است -->
</body>
</html>
