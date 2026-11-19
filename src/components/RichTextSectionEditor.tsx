// ===== IMPORTS & DEPENDENCIES =====
import React, { useState, useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  List,
  Heading3,
  RotateCcw,
  Save,
  Code,
  Eye,
  Check,
} from 'lucide-react';
import { ReportSection, ReportSectionKey } from '../types/seo.ts';

// ===== CONFIGURATION & CONSTANTS =====
export const SECTION_LABELS: Record<
  ReportSectionKey,
  { number: string; title: string; subtitle: string }
> = {
  executive_summary: {
    number: '۰۱',
    title: 'خلاصه مدیریتی و چشم‌انداز رشد (Executive Summary)',
    subtitle: 'تصویر کلان ترافیک فعلی، پتانسیل رتبه ۱ و گلوگاه‌های اصلی پروژه',
  },
  technical: {
    number: '۰۲',
    title: 'سئو تکنیکال، وضعیت ایندکس و معماری عمق کلیک',
    subtitle: 'تحلیل خروجی Screaming Frog، بودجه خزش، کدهای 404/301 و Click Depth',
  },
  keyword_pillar: {
    number: '۰۳',
    title: 'استراتژی کلمات کلیدی، Quick Wins و ساختار Pillar-Cluster',
    subtitle: 'تحلیل داده‌های سرچ کنسول، عبارات فرصت سریع (رتبه ۴ تا ۱۵) و خوشه‌بندی موضوعی',
  },
  onpage: {
    number: '۰۴',
    title: 'سلامت On-Page و بهینه‌سازی نرخ کلیک (CTR Optimization)',
    subtitle: 'بررسی تایتل‌های تکراری/خالی، متا دیسکریپشن‌ها و ساختار هدینگ H1',
  },
  offpage_competitors: {
    number: '۰۵',
    title: 'تحلیل رقبا، اعتبار دامنه (DR) و استراتژی لینک‌سازی Off-Page',
    subtitle: 'مقایسه پروفایل بک‌لینک و Referring Domains با رقبای اصلی بازار',
  },
  speed_cwv: {
    number: '۰۶',
    title: 'سرعت بارگذاری و حیاتی‌ترین شاخص‌های وب (Core Web Vitals)',
    subtitle: 'تحلیل PageSpeed موبایل و دسکتاپ و شاخص‌های LCP، INP و CLS',
  },
};

interface RichTextSectionEditorProps {
  section: ReportSection;
  onSave: (sectionKey: ReportSectionKey, html: string) => Promise<void>;
}

// ===== RICH TEXT EDITOR COMPONENT (CKEditor / TinyMCE Equivalent WYSIWYG) =====
export const RichTextSectionEditor: React.FC<RichTextSectionEditorProps> = ({
  section,
  onSave,
}) => {
  const [htmlContent, setHtmlContent] = useState<string>(section.final_edited_html);
  const [sourceMode, setSourceMode] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHtmlContent(section.final_edited_html);
    if (editorRef.current && !sourceMode) {
      editorRef.current.innerHTML = section.final_edited_html;
    }
  }, [section.final_edited_html, section.id, sourceMode]);

  const applyFormat = (command: string, value?: string) => {
    if (sourceMode || !editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setHtmlContent(editorRef.current.innerHTML);
  };

  const handleRestoreAi = () => {
    setHtmlContent(section.ai_generated_html);
    if (editorRef.current && !sourceMode) {
      editorRef.current.innerHTML = section.ai_generated_html;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentHtml =
        !sourceMode && editorRef.current ? editorRef.current.innerHTML : htmlContent;
      await onSave(section.section_key, currentHtml);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const meta = SECTION_LABELS[section.section_key];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Section Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-mono font-semibold text-indigo-600">
              بخش {meta.number}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{section.section_key}</span>
            <span aria-hidden="true">·</span>
            <span>
              آخرین ویرایش:{' '}
              {new Date(section.updated_at).toLocaleTimeString('fa-IR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900">{meta.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{meta.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRestoreAi}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="بازگردانی به متن اولیه تولیدشده توسط هوش مصنوعی"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بازگردانی نسخه AI</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {savedNotice ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>ذخیره شد</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'در حال ذخیره...' : 'ذخیره تغییرات بخش'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Formatting Toolbar */}
      <div className="px-4 py-2 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => applyFormat('formatBlock', 'H3')}
            disabled={sourceMode}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-40"
            title="تیتر فرعی (H3)"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('bold')}
            disabled={sourceMode}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-40"
            title="ضخیم (Bold)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('italic')}
            disabled={sourceMode}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-40"
            title="مورب (Italic)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('insertUnorderedList')}
            disabled={sourceMode}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-40"
            title="لیست بولت‌دار"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!sourceMode && editorRef.current) {
              setHtmlContent(editorRef.current.innerHTML);
            }
            setSourceMode(!sourceMode);
          }}
          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-md flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          {sourceMode ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>نمای ویرایشگر دیداری (WYSIWYG)</span>
            </>
          ) : (
            <>
              <Code className="w-3.5 h-3.5" />
              <span>ویرایش کد HTML</span>
            </>
          )}
        </button>
      </div>

      {/* Editable Content Surface */}
      <div className="p-5">
        {sourceMode ? (
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            dir="ltr"
            rows={8}
            className="w-full font-mono text-xs p-3 bg-slate-900 text-slate-100 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setHtmlContent(e.currentTarget.innerHTML)}
            className="seo-prose min-h-[160px] p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
          />
        )}
      </div>
    </div>
  );
};
