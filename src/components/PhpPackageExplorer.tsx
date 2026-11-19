// ===== IMPORTS & DEPENDENCIES =====
import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, FileCode, Database } from 'lucide-react';

interface PhpFileItem {
  id: string;
  title: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

// ===== PHP 8.1+ & MYSQL 8.0 CPANEL PACKAGE EXPLORER =====
export const PhpPackageExplorer: React.FC = () => {
  const [files, setFiles] = useState<PhpFileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>('database.sql');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/php-package')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.files)) {
          setFiles(data.files);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadFile = (file: PhpFileItem) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.id;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Architecture Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              پکیج کامل کدهای PHP 8.1+ و دیتابیس MySQL 8.0 (آماده استقرار روی cPanel / DirectAdmin)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              شامل اسکیمای ۸ جدول با کلیدهای خارجی و حذف آبشاری (ON DELETE CASCADE)، کلاس PDO امن، پارسر جریانی CSV، سرویس PageSpeed cURL و کلاس AIReportGenerator
            </p>
          </div>
          {activeFile && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(activeFile.content, activeFile.id)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                {copiedId === activeFile.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی کل کد فایل</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleDownloadFile(activeFile)}
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>دانلود فایل ({activeFile.id})</span>
              </button>
            </div>
          )}
        </div>

        {/* Folder Structure Overview */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-mono" dir="ltr">
          <span>php-cpanel-package/</span>
          <span>├── database.sql</span>
          <span>├── src/Database.php</span>
          <span>├── src/CsvParser.php</span>
          <span>├── src/PageSpeedService.php</span>
          <span>├── src/GeminiService.php</span>
          <span>└── public/index.php</span>
        </div>
      </div>

      {/* File Selector & Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar File List */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
          {loading ? (
            <div className="p-6 text-xs text-slate-500">در حال بارگذاری فایل‌ها...</div>
          ) : (
            files.map((file) => {
              const isSelected = file.id === activeFile?.id;
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setActiveFileId(file.id)}
                  className={`w-full text-right p-4 transition-colors flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/80 text-indigo-950'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {file.language === 'sql' ? (
                    <Database className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  ) : (
                    <FileCode className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">{file.title}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5" dir="ltr">
                      {file.path}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {file.description}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Full Source Code Box */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {activeFile && (
            <>
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono" dir="ltr">
                  {activeFile.path}
                </span>
                <span className="font-mono text-slate-400">
                  {activeFile.content.split('\n').length} lines · UTF-8
                </span>
              </div>
              <pre
                dir="ltr"
                className="p-5 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed max-h-[680px] overflow-y-auto"
              >
                <code>{activeFile.content}</code>
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
