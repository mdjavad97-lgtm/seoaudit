<?php
declare(strict_types=1);

namespace SeoAuditSaaS\Core;

use PDO;
use PDOException;
use RuntimeException;

/**
 * کلاس مدیریت اتصال امن به دیتابیس MySQL با الگوی Singleton و PDO
 * بهینه‌شده برای هاست‌های اشتراکی cPanel / DirectAdmin و یونیکد فارسی utf8mb4
 */
final class Database
{
    private static ?PDO $instance = null;

    private function __construct() {}
    private function __clone() {}

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
            $port = $_ENV['DB_PORT'] ?? '3306';
            $dbName = $_ENV['DB_DATABASE'] ?? 'seo_audit_saas';
            $username = $_ENV['DB_USERNAME'] ?? 'root';
            $password = $_ENV['DB_PASSWORD'] ?? '';

            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                $host,
                $port,
                $dbName
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
            ];

            try {
                self::$instance = new PDO($dsn, $username, $password, $options);
            } catch (PDOException $e) {
                error_log('[Database Connection Error] ' . $e->getMessage());
                throw new RuntimeException('خطا در برقراری ارتباط با پایگاه داده MySQL.');
            }
        }

        return self::$instance;
    }

    /**
     * اجرای امن تراکنش‌های چندمرحله‌ای
     */
    public static function transaction(callable $callback): mixed
    {
        $pdo = self::getConnection();
        try {
            $pdo->beginTransaction();
            $result = $callback($pdo);
            $pdo->commit();
            return $result;
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }
}
