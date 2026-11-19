// ===== IMPORTS & DEPENDENCIES =====
import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  Printer,
  FolderKanban,
  Calendar,
  ExternalLink,
  Check,
  RefreshCw,
  Building2,
} from 'lucide-react';
import {
  UserAgency,
  Project,
  Audit,
  FullAuditDetails,
  ReportSectionKey,
  ActionPriority,
  AssignedTeam,
} from './types/seo.ts';
import { DataIngestionPanel } from './components/DataIngestionPanel.tsx';
import { RichTextSectionEditor } from './components/RichTextSectionEditor.tsx';
import { ClientReportView } from './components/ClientReportView.tsx';
import { PhpPackageExplorer } from './components/PhpPackageExplorer.tsx';
import { ActionPlanTable } from './components/ActionPlanTable.tsx';

type ActiveTab =
  | 'projects'
  | 'ingestion'
  | 'ai_editor'
  | 'client_report'
  | 'php_package';

const SECTION_KEYS_ORDER: ReportSectionKey[] = [
  'executive_summary',
  'technical',
  'keyword_pillar',
  'onpage',
  'offpage_competitors',
  'speed_cwv',
];

// ===== MAIN APPLICATION COMPONENT =====
export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('client_report');
  const [agency, setAgency] = useState<UserAgency | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [selectedAuditId, setSelectedAuditId] = useState<number>(101);
  const [auditDetails, setAuditDetails] = useState<FullAuditDetails | null>(null);
  const [loadingAudit, setLoadingAudit] = useState<boolean>(true);

  // Modals & Form States
  const [showNewProjectForm, setShowNewProjectForm] = useState<boolean>(false);
  const [newProjDomain, setNewProjDomain] = useState('');
  const [newProjClient, setNewProjClient] = useState('');
  const [newProjCms, setNewProjCms] = useState('WordPress + WooCommerce');
  const [newProjIndustry, setNewProjIndustry] = useState('فروشگاه اینترنتی');
  const [newProjCompetitors, setNewProjCompetitors] = useState(
    'digikala.com, torob.com, technolife.ir'
  );

  const [showNewAuditForm, setShowNewAuditForm] = useState<boolean>(false);
  const [newAuditTitle, setNewAuditTitle] = useState('');
  const [newAuditDate, setNewAuditDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // AI Engine Generation State
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [aiError, setAiError] = useState<string>('');
  const [showJsonPayload, setShowJsonPayload] = useState<boolean>(false);

  // Agency Edit State
  const [agencySaved, setAgencySaved] = useState<boolean>(false);

  // Check if URL has ?share=TOKEN for direct client share view
  const urlShareToken = new URLSearchParams(window.location.search).get('share');

  const fetchBootstrap = useCallback(async () => {
    const resp = await fetch('/api/bootstrap');
    const data = await resp.json();
    setAgency(data.agency);
    setProjects(data.projects);
    setAudits(data.audits);
  }, []);

  const fetchAuditDetails = useCallback(async (idOrToken: number | string) => {
    setLoadingAudit(true);
    try {
      const resp = await fetch(`/api/audits/${idOrToken}`);
      if (!resp.ok) return;
      const data: FullAuditDetails = await resp.json();
      setAuditDetails(data);
      setSelectedProjectId(data.project.id);
      setSelectedAuditId(data.audit.id);
    } finally {
      setLoadingAudit(false);
    }
  }, []);

  useEffect(() => {
    fetchBootstrap();
    if (urlShareToken) {
      setActiveTab('client_report');
      fetchAuditDetails(urlShareToken);
    } else {
      fetchAuditDetails(101);
    }
  }, [fetchBootstrap, fetchAuditDetails, urlShareToken]);

  const handleSelectProject = (projectId: number) => {
    setSelectedProjectId(projectId);
    const projectAudits = audits.filter((a) => a.project_id === projectId);
    if (projectAudits.length > 0) {
      fetchAuditDetails(projectAudits[0].id);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjDomain.trim() || !newProjClient.trim()) return;
    const resp = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: newProjDomain,
        client_name: newProjClient,
        cms_type: newProjCms,
        industry: newProjIndustry,
        competitors: newProjCompetitors,
      }),
    });
    const data = await resp.json();
    if (resp.ok) {
      await fetchBootstrap();
      setShowNewProjectForm(false);
      setNewProjDomain('');
      setNewProjClient('');
      fetchAuditDetails(data.initialAudit.id);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (projects.length <= 1) return;
    const resp = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
    if (resp.ok) {
      const remainingProjects = projects.filter((p) => p.id !== projectId);
      await fetchBootstrap();
      if (remainingProjects.length > 0) {
        handleSelectProject(remainingProjects[0].id);
      }
    }
  };

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuditTitle.trim()) return;
    const resp = await fetch(`/api/projects/${selectedProjectId}/audits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newAuditTitle,
        audit_date: newAuditDate,
        status: 'draft',
      }),
    });
    const data = await resp.json();
    if (resp.ok) {
      await fetchBootstrap();
      setShowNewAuditForm(false);
      setNewAuditTitle('');
      fetchAuditDetails(data.audit.id);
    }
  };

  const handleGenerateAiReport = async () => {
    if (!auditDetails) return;
    setAiGenerating(true);
    setAiMessage('');
    setAiError('');
    try {
      const resp = await fetch(`/api/audits/${auditDetails.audit.id}/generate-ai`, {
        method: 'POST',
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'خطا در تولید گزارش هوشمند');
      }
      setAuditDetails({
        ...auditDetails,
        report_sections: data.report_sections,
        action_plans: data.action_plans,
      });
      setAiMessage(
        'تحلیل هوشمند ۶ بخش گزارش و نقشه راه اجرایی با موفقیت توسط موتور Gemini تولید و در دیتابیس ذخیره شد.'
      );
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSaveSection = async (
    sectionKey: ReportSectionKey,
    final_edited_html: string
  ) => {
    if (!auditDetails) return;
    const resp = await fetch(
      `/api/audits/${auditDetails.audit.id}/sections/${sectionKey}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ final_edited_html }),
      }
    );
    const data = await resp.json();
    if (resp.ok) {
      setAuditDetails({
        ...auditDetails,
        report_sections: auditDetails.report_sections.map((s) =>
          s.section_key === sectionKey ? data.section : s
        ),
      });
    }
  };

  const handleToggleTask = async (taskId: number, is_completed: boolean) => {
    if (!auditDetails) return;
    const resp = await fetch(`/api/action-plans/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed }),
    });
    const data = await resp.json();
    if (resp.ok) {
      setAuditDetails({
        ...auditDetails,
        action_plans: auditDetails.action_plans.map((t) =>
          t.id === taskId ? data.task : t
        ),
      });
    }
  };

  const handleAddTask = async (newTask: {
    task_title: string;
    category: string;
    priority: ActionPriority;
    impact_score: number;
    assigned_team: AssignedTeam;
  }) => {
    if (!auditDetails) return;
    const resp = await fetch(`/api/audits/${auditDetails.audit.id}/action-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });
    const data = await resp.json();
    if (resp.ok) {
      setAuditDetails({
        ...auditDetails,
        action_plans: [data.task, ...auditDetails.action_plans],
      });
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!auditDetails) return;
    const resp = await fetch(`/api/action-plans/${taskId}`, {
      method: 'DELETE',
    });
    if (resp.ok) {
      setAuditDetails({
        ...auditDetails,
        action_plans: auditDetails.action_plans.filter((t) => t.id !== taskId),
      });
    }
  };

  const handleTogglePublishStatus = async () => {
    if (!auditDetails) return;
    const nextStatus =
      auditDetails.audit.status === 'published' ? 'draft' : 'published';
    const resp = await fetch(`/api/audits/${auditDetails.audit.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await resp.json();
    if (resp.ok) {
      setAuditDetails({ ...auditDetails, audit: data.audit });
      setAudits(audits.map((a) => (a.id === data.audit.id ? data.audit : a)));
    }
  };

  const handleSaveAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency) return;
    const resp = await fetch('/api/agency', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agency),
    });
    const data = await resp.json();
    if (resp.ok) {
      setAgency(data.agency);
      if (auditDetails) {
        setAuditDetails({ ...auditDetails, agency: data.agency });
      }
      setAgencySaved(true);
      setTimeout(() => setAgencySaved(false), 2500);
    }
  };

  const projectAudits = audits.filter((a) => a.project_id === selectedProjectId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 3-Zone Top Bar Contract (Hidden when printing A4 PDF) */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-8 no-print sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          سئوآدیت پرو
        </a>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'projects'
                ? 'border-indigo-600 text-slate-950 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            داشبورد پروژه‌ها
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ingestion')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'ingestion'
                ? 'border-indigo-600 text-slate-950 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            ورودی‌ها و پارسر CSV
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai_editor')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'ai_editor'
                ? 'border-indigo-600 text-slate-950 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            ویرایشگر هوش مصنوعی
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('client_report')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'client_report'
                ? 'border-indigo-600 text-slate-950 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            گزارش گرافیکی کارفرما
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('php_package')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'php_package'
                ? 'border-indigo-600 text-slate-950 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            سورس‌کد PHP و MySQL
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('client_report');
              setTimeout(() => window.print(), 150);
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>خروجی PDF A4</span>
          </button>
        </div>
      </header>

      {/* Workspace Context Bar: Active Project & Audit Selector */}
      {!urlShareToken && (
        <div className="bg-slate-100/90 border-b border-slate-200 px-6 py-2.5 no-print">
          <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Project Selector */}
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-medium text-slate-600">
                  پروژه فعال:
                </span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleSelectProject(Number(e.target.value))}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.client_name} ({p.domain})
                    </option>
                  ))}
                </select>
              </div>

              {/* Audit Date Selector */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-medium text-slate-600">
                  گزارش دوره‌ای:
                </span>
                <select
                  value={selectedAuditId}
                  onChange={(e) => fetchAuditDetails(Number(e.target.value))}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  {projectAudits.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.audit_date}] {a.title} ({a.status === 'published' ? 'منتشرشده' : 'پیش‌نویس'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Workspace Actions */}
            <div className="flex items-center gap-2">
              {auditDetails && (
                <button
                  type="button"
                  onClick={handleTogglePublishStatus}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  وضعیت:{' '}
                  <strong
                    className={
                      auditDetails.audit.status === 'published'
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }
                  >
                    {auditDetails.audit.status === 'published'
                      ? 'منتشرشده برای کارفرما'
                      : 'پیش‌نویس (تغییر به انتشار)'}
                  </strong>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveTab('projects');
                  setShowNewAuditForm(true);
                }}
                className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ثبت گزارش تاریخ جدید</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 py-8">
        {loadingAudit || !auditDetails ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-sm text-slate-500">
            در حال بارگذاری اطلاعات پروژه و جداول گزارش سئو...
          </div>
        ) : (
          <>
            {/* TAB 1: PROJECTS & MULTI-DATE AUDITS DASHBOARD */}
            {activeTab === 'projects' && (
              <div className="space-y-8">
                {/* Projects Section Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">
                      مدیریت چندپروژه‌ای سایت‌ها و گزارش‌های ادواری (Projects & Audits)
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      اطلاعات هر پروژه با کلید خارجی (project_id) و حذف آبشاری (ON DELETE CASCADE) کاملاً تفکیک شده است
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowNewAuditForm(!showNewAuditForm)}
                      className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>افزودن گزارش جدید برای پروژه فعلی</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowNewProjectForm(!showNewProjectForm)}
                      className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>تعریف سایت / پروژه جدید</span>
                    </button>
                  </div>
                </div>

                {/* New Project Modal/Card */}
                {showNewProjectForm && (
                  <form
                    onSubmit={handleCreateProject}
                    className="bg-white border border-indigo-200 rounded-xl p-6 space-y-4"
                  >
                    <h3 className="text-base font-bold text-slate-900">
                      تعریف پروژه / وب‌سایت جدید در دیتابیس (جدول projects)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          دامنه سایت (Domain)
                        </label>
                        <input
                          type="text"
                          required
                          dir="ltr"
                          value={newProjDomain}
                          onChange={(e) => setNewProjDomain(e.target.value)}
                          placeholder="shop-example.ir"
                          className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          نام برند / کارفرما (Client Name)
                        </label>
                        <input
                          type="text"
                          required
                          value={newProjClient}
                          onChange={(e) => setNewProjClient(e.target.value)}
                          placeholder="فروشگاه زنجیره‌ای سپهر"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          سیستم مدیریت محتوا (CMS Type)
                        </label>
                        <input
                          type="text"
                          value={newProjCms}
                          onChange={(e) => setNewProjCms(e.target.value)}
                          placeholder="WordPress / Laravel / Next.js"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          حوزه فعالیت (Industry)
                        </label>
                        <input
                          type="text"
                          value={newProjIndustry}
                          onChange={(e) => setNewProjIndustry(e.target.value)}
                          placeholder="تجارت الکترونیک و خرده‌فروشی"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          دامنه ۳ تا ۵ رقیب اصلی (جداشده با کاما — ذخیره در competitors_json)
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={newProjCompetitors}
                          onChange={(e) => setNewProjCompetitors(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewProjectForm(false)}
                        className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                      >
                        ایجاد پروژه و ساخت اولین گزارش
                      </button>
                    </div>
                  </form>
                )}

                {/* New Dated Audit Form */}
                {showNewAuditForm && (
                  <form
                    onSubmit={handleCreateAudit}
                    className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
                  >
                    <h3 className="text-base font-bold text-slate-900">
                      ثبت گزارش آنالیز جدید در تاریخ متفاوت برای{' '}
                      <span className="font-mono text-indigo-700">
                        {auditDetails.project.domain}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          عنوان گزارش آنالیز
                        </label>
                        <input
                          type="text"
                          required
                          value={newAuditTitle}
                          onChange={(e) => setNewAuditTitle(e.target.value)}
                          placeholder="گزارش آنالیز سئو تکنیکال و استراتژی زمستان ۱۴۰۵"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          تاریخ آنالیز (audit_date)
                        </label>
                        <input
                          type="date"
                          value={newAuditDate}
                          onChange={(e) => setNewAuditDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowNewAuditForm(false)}
                        className="px-4 py-2 text-xs font-medium text-slate-600"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                      >
                        ثبت گزارش جدید
                      </button>
                    </div>
                  </form>
                )}

                {/* Projects Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {projects.map((proj) => {
                    const isSelected = proj.id === selectedProjectId;
                    const projAudits = audits.filter((a) => a.project_id === proj.id);

                    return (
                      <div
                        key={proj.id}
                        className={`bg-white border rounded-xl p-6 flex flex-col justify-between transition-colors ${
                          isSelected
                            ? 'border-indigo-600 ring-1 ring-indigo-600'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="text-xs text-slate-500">
                                {proj.industry} · {proj.cms_type}
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                                {proj.client_name}
                              </h3>
                            </div>
                            {projects.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteProject(proj.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                                title="حذف پروژه و تمام گزارش‌های زیرمجموعه (ON DELETE CASCADE)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div
                            className="text-sm font-mono font-semibold text-indigo-700 mb-3"
                            dir="ltr"
                          >
                            https://{proj.domain}
                          </div>

                          <div className="text-xs text-slate-500 mb-4">
                            <span>رقبا ({proj.competitors_json.length}): </span>
                            <span className="font-mono text-slate-700" dir="ltr">
                              {proj.competitors_json.join(' · ')}
                            </span>
                          </div>

                          {/* Audits List for this Project */}
                          <div className="border-t border-slate-100 pt-3 space-y-2">
                            <div className="text-xs font-semibold text-slate-700">
                              گزارش‌های ثبت‌شده ({projAudits.length}):
                            </div>
                            {projAudits.map((a) => (
                              <button
                                key={a.id}
                                type="button"
                                onClick={() => {
                                  fetchAuditDetails(a.id);
                                  setActiveTab('client_report');
                                }}
                                className={`w-full text-right p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between gap-2 ${
                                  a.id === selectedAuditId
                                    ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-semibold'
                                    : 'bg-slate-50 border-slate-200/70 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <span className="truncate">{a.title}</span>
                                <span className="font-mono text-[11px] text-slate-500 shrink-0">
                                  {a.audit_date}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectProject(proj.id);
                              setActiveTab('ingestion');
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0"
                          >
                            آپلود CSV / PageSpeed
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectProject(proj.id);
                              setActiveTab('client_report');
                            }}
                            className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1 whitespace-nowrap shrink-0"
                          >
                            <span>مشاهده داشبورد گزارش</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Agency White-Label Profile Settings (users table) */}
                {agency && (
                  <form
                    onSubmit={handleSaveAgency}
                    className="bg-white border border-slate-200 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            مشخصات آژانس سئو و برندینگ گزارش‌ها (جدول users)
                          </h3>
                          <p className="text-xs text-slate-500">
                            این اطلاعات در هدر و فوتر لینک اختصاصی کارفرما و خروجی چاپی PDF A4 نمایش داده می‌شود
                          </p>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        {agencySaved ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>ذخیره شد</span>
                          </>
                        ) : (
                          <span>ذخیره برندینگ آژانس</span>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          نام آژانس / شرکت سئو (agency_name)
                        </label>
                        <input
                          type="text"
                          value={agency.agency_name}
                          onChange={(e) =>
                            setAgency({ ...agency, agency_name: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          نام مدیر / کارشناس ارشد (name)
                        </label>
                        <input
                          type="text"
                          value={agency.name}
                          onChange={(e) => setAgency({ ...agency, name: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          اطلاعات تماس فوتر گزارش (agency_contact)
                        </label>
                        <input
                          type="text"
                          value={agency.agency_contact}
                          onChange={(e) =>
                            setAgency({ ...agency, agency_contact: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: CSV INGESTION & PAGESPEED INSIGHTS API */}
            {activeTab === 'ingestion' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">
                      ورودی‌های داده و پارسرهای خودکار — {auditDetails.project.client_name}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      آپلود فایل CSV سرچ کنسول (Queries.csv)، فایل اسکریمینگ فراگ (internal_all.csv) و استعلام مستقیم PageSpeed Insights API v5
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ai_editor')}
                    className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg whitespace-nowrap shrink-0"
                  >
                    مرحله بعد: تولید تحلیل هوشمند با Gemini AI
                  </button>
                </div>

                <DataIngestionPanel
                  auditDetails={auditDetails}
                  onGscUpdated={(gsc_keywords) =>
                    setAuditDetails({ ...auditDetails, gsc_keywords })
                  }
                  onTechUpdated={(technical_crawl_stats) =>
                    setAuditDetails({ ...auditDetails, technical_crawl_stats })
                  }
                  onSpeedUpdated={(speed_and_competitors) =>
                    setAuditDetails({ ...auditDetails, speed_and_competitors })
                  }
                />
              </div>
            )}

            {/* TAB 3: AI ANALYSIS ENGINE & RICH TEXT EDITOR */}
            {activeTab === 'ai_editor' && (
              <div className="space-y-6">
                {/* AI Report Generator Control Banner */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-mono text-indigo-600 mb-1">
                        AIReportGenerator :: Gemini Structured JSON Engine
                      </div>
                      <h1 className="text-xl font-extrabold text-slate-900">
                        موتور تولید گزارش تحلیلی سئو با هوش مصنوعی و ویرایشگر کارشناس
                      </h1>
                      <p className="text-xs text-slate-500 mt-1">
                        تجمیع خودکار آمارهای GSC، Screaming Frog و جدول CWV رقبا در قالب JSON سبک و تولید ۶ فصل تحلیلی + نقشه راه اجرایی
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowJsonPayload(!showJsonPayload)}
                        className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0"
                      >
                        {showJsonPayload
                          ? 'بستن پیش‌نمایش JSON ورودی'
                          : 'مشاهده JSON ارسالی به AI'}
                      </button>

                      <button
                        type="button"
                        disabled={aiGenerating}
                        onClick={handleGenerateAiReport}
                        className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50"
                      >
                        {aiGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>در حال تحلیل داده‌ها توسط Gemini AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>تولید / بازنویسی کامل گزارش با Gemini AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {aiMessage && (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{aiMessage}</span>
                    </div>
                  )}

                  {aiError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                      {aiError}
                    </div>
                  )}

                  {showJsonPayload && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="text-xs font-semibold text-slate-700 mb-2">
                        ساختار JSON سبک ارسالی از کلاس AIReportGenerator به Gemini API:
                      </div>
                      <pre
                        dir="ltr"
                        className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto max-h-72"
                      >
                        {JSON.stringify(
                          {
                            project: {
                              domain: auditDetails.project.domain,
                              client_name: auditDetails.project.client_name,
                              cms_type: auditDetails.project.cms_type,
                              industry: auditDetails.project.industry,
                            },
                            gsc_top_keywords: auditDetails.gsc_keywords.slice(0, 8),
                            technical_crawl_stats: auditDetails.technical_crawl_stats,
                            speed_and_competitors: auditDetails.speed_and_competitors,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>

                {/* 6 Rich Text Editors for report_sections */}
                <div className="space-y-5">
                  {SECTION_KEYS_ORDER.map((sectionKey) => {
                    const sec = auditDetails.report_sections.find(
                      (s) => s.section_key === sectionKey
                    );
                    if (!sec) return null;
                    return (
                      <RichTextSectionEditor
                        key={sectionKey}
                        section={sec}
                        onSave={handleSaveSection}
                      />
                    );
                  })}
                </div>

                {/* Editable Action Plan Table */}
                <ActionPlanTable
                  tasks={auditDetails.action_plans}
                  domain={auditDetails.project.domain}
                  onToggleTask={handleToggleTask}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                />
              </div>
            )}

            {/* TAB 4: FINAL GRAPHICAL REPORT & CLIENT SHARE VIEW */}
            {activeTab === 'client_report' && (
              <ClientReportView
                auditDetails={auditDetails}
                isClientShareMode={Boolean(urlShareToken)}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {/* TAB 5: PHP 8.1+ & MYSQL 8.0 CPANEL DELIVERABLE PACKAGE */}
            {activeTab === 'php_package' && <PhpPackageExplorer />}
          </>
        )}
      </main>
    </div>
  );
}
