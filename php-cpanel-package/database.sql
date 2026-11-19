-- ============================================================================
-- SEO Audit & Strategy Generator Platform (Multi-Project SaaS)
-- Database Engine: MySQL 8.0+ / MariaDB 10.6+
-- Character Set: utf8mb4 / Collation: utf8mb4_unicode_ci
-- Compatible with cPanel & DirectAdmin Shared Hosting
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `seo_audit_saas`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `seo_audit_saas`;

-- ----------------------------------------------------------------------------
-- 1. جدول کاربران و اطلاعات آژانس / مشاور سئو (users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `agency_name` VARCHAR(180) DEFAULT NULL,
  `agency_logo` VARCHAR(500) DEFAULT NULL,
  `agency_contact` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. جدول پروژه‌ها / سایت‌های تحت مدیریت (projects)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `domain` VARCHAR(255) NOT NULL,
  `client_name` VARCHAR(180) NOT NULL,
  `cms_type` VARCHAR(100) NOT NULL DEFAULT 'WordPress',
  `industry` VARCHAR(150) NOT NULL,
  `competitors_json` JSON NOT NULL COMMENT 'لیست ۳ تا ۵ دامنه رقیب به صورت آرایه JSON',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_projects_user_id` (`user_id`),
  KEY `idx_projects_domain` (`domain`),
  CONSTRAINT `fk_projects_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. جدول گزارش‌های آنالیز دوره‌ای هر پروژه (audits)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audits` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `audit_date` DATE NOT NULL,
  `share_token` VARCHAR(64) NOT NULL,
  `share_password` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_audits_share_token` (`share_token`),
  KEY `idx_audits_project_date` (`project_id`, `audit_date`),
  CONSTRAINT `fk_audits_project`
    FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. جدول کلمات کلیدی سرچ کنسول و تخمین رشد ترافیک (gsc_keywords)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `gsc_keywords` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `audit_id` INT UNSIGNED NOT NULL,
  `query` VARCHAR(350) NOT NULL,
  `clicks` INT UNSIGNED NOT NULL DEFAULT 0,
  `impressions` INT UNSIGNED NOT NULL DEFAULT 0,
  `ctr` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `position` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `estimated_clicks_top1` INT UNSIGNED NOT NULL DEFAULT 0,
  `growth_multiplier` DECIMAL(5,1) NOT NULL DEFAULT 1.0,
  `cluster_tag` VARCHAR(100) NOT NULL DEFAULT 'General',
  PRIMARY KEY (`id`),
  KEY `idx_gsc_audit_impressions` (`audit_id`, `impressions` DESC),
  KEY `idx_gsc_audit_cluster` (`audit_id`, `cluster_tag`),
  CONSTRAINT `fk_gsc_keywords_audit`
    FOREIGN KEY (`audit_id`) REFERENCES `audits` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. جدول آمارهای خزش تکنیکال Screaming Frog (technical_crawl_stats)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `technical_crawl_stats` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `audit_id` INT UNSIGNED NOT NULL,
  `total_urls` INT UNSIGNED NOT NULL DEFAULT 0,
  `indexable_urls` INT UNSIGNED NOT NULL DEFAULT 0,
  `duplicate_titles` INT UNSIGNED NOT NULL DEFAULT 0,
  `missing_titles` INT UNSIGNED NOT NULL DEFAULT 0,
  `missing_descriptions` INT UNSIGNED NOT NULL DEFAULT 0,
  `missing_h1` INT UNSIGNED NOT NULL DEFAULT 0,
  `status_404_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `status_301_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `click_depth_distribution_json` JSON NOT NULL COMMENT 'توزیع صفحات در عمق کلیک ۱ تا +۶',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_tech_crawl_audit` (`audit_id`),
  CONSTRAINT `fk_tech_crawl_audit`
    FOREIGN KEY (`audit_id`) REFERENCES `audits` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. جدول مقایسه سرعت CWV و اعتبار دامنه با رقبا (speed_and_competitors)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `speed_and_competitors` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `audit_id` INT UNSIGNED NOT NULL,
  `domain` VARCHAR(255) NOT NULL,
  `is_main_site` TINYINT(1) NOT NULL DEFAULT 0,
  `dr_score` INT UNSIGNED NOT NULL DEFAULT 0,
  `referring_domains` INT UNSIGNED NOT NULL DEFAULT 0,
  `mobile_perf_score` INT UNSIGNED NOT NULL DEFAULT 0,
  `desktop_perf_score` INT UNSIGNED NOT NULL DEFAULT 0,
  `lcp_seconds` DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  `inp_ms` INT UNSIGNED NOT NULL DEFAULT 0,
  `cls_score` DECIMAL(4,3) NOT NULL DEFAULT 0.000,
  PRIMARY KEY (`id`),
  KEY `idx_speed_comp_audit` (`audit_id`, `is_main_site` DESC),
  CONSTRAINT `fk_speed_comp_audit`
    FOREIGN KEY (`audit_id`) REFERENCES `audits` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. جدول بخش‌های تحلیلی گزارش تولیدشده با AI و ویرایش‌شده (report_sections)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `report_sections` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `audit_id` INT UNSIGNED NOT NULL,
  `section_key` ENUM(
    'executive_summary',
    'technical',
    'keyword_pillar',
    'onpage',
    'offpage_competitors',
    'speed_cwv'
  ) NOT NULL,
  `ai_generated_html` LONGTEXT DEFAULT NULL,
  `final_edited_html` LONGTEXT DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_report_section_audit_key` (`audit_id`, `section_key`),
  CONSTRAINT `fk_report_sections_audit`
    FOREIGN KEY (`audit_id`) REFERENCES `audits` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. جدول نقشه راه اجرایی اولویت‌بندی‌شده (action_plans)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `action_plans` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `audit_id` INT UNSIGNED NOT NULL,
  `task_title` VARCHAR(350) NOT NULL,
  `category` VARCHAR(120) NOT NULL,
  `priority` ENUM('high', 'medium', 'low') NOT NULL DEFAULT 'medium',
  `impact_score` TINYINT UNSIGNED NOT NULL DEFAULT 5 COMMENT 'امتیاز اثرگذاری ۱ تا ۱۰',
  `assigned_team` ENUM('technical', 'content', 'seo', 'ui_ux') NOT NULL DEFAULT 'seo',
  `is_completed` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_action_plans_audit_priority` (`audit_id`, `priority`, `impact_score` DESC),
  CONSTRAINT `fk_action_plans_audit`
    FOREIGN KEY (`audit_id`) REFERENCES `audits` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
