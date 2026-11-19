// ===== IMPORTS & DEPENDENCIES =====
import React, { useState } from 'react';
import {
  Download,
  Printer,
  Plus,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  ActionPlanItem,
  ActionPriority,
  AssignedTeam,
} from '../types/seo.ts';

// ===== TYPES & CONSTANTS =====
interface ActionPlanTableProps {
  tasks: ActionPlanItem[];
  domain: string;
  readOnly?: boolean;
  onToggleTask?: (taskId: number, completed: boolean) => Promise<void>;
  onAddTask?: (task: {
    task_title: string;
    category: string;
    priority: ActionPriority;
    impact_score: number;
    assigned_team: AssignedTeam;
  }) => Promise<void>;
  onDeleteTask?: (taskId: number) => Promise<void>;
}

const PRIORITY_LABELS: Record<ActionPriority, { label: string; colorClass: string }> = {
  high: { label: 'اولویت بالا (فوری)', colorClass: 'text-red-700 font-semibold' },
  medium: { label: 'اولویت متوسط', colorClass: 'text-amber-700 font-medium' },
  low: { label: 'اولویت پایین', colorClass: 'text-slate-600' },
};

const TEAM_LABELS: Record<AssignedTeam, string> = {
  technical: 'تیم فنی و بک‌اند (Technical)',
  content: 'تیم تولید محتوا (Content)',
  seo: 'تیم استراتژی سئو (SEO)',
  ui_ux: 'تیم فرانت‌اند و UI/UX',
};

// ===== INTERACTIVE ACTION PLAN ROADMAP TABLE =====
export const ActionPlanTable: React.FC<ActionPlanTableProps> = ({
  tasks,
  domain,
  readOnly = false,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<'all' | ActionPriority>('all');
  const [teamFilter, setTeamFilter] = useState<'all' | AssignedTeam>('all');
  const [showAddRow, setShowAddRow] = useState<boolean>(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newCategory, setNewCategory] = useState('سئو تکنیکال');
  const [newPriority, setNewPriority] = useState<ActionPriority>('high');
  const [newImpact, setNewImpact] = useState<number>(9);
  const [newTeam, setNewTeam] = useState<AssignedTeam>('technical');

  const filteredTasks = tasks.filter((t) => {
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchTeam = teamFilter === 'all' || t.assigned_team === teamFilter;
    return matchPriority && matchTeam;
  });

  // Export Action Plans as UTF-8 BOM CSV for Excel Persian compatibility
  const handleExportCsv = () => {
    const headers = [
      'شناسه',
      'عنوان اقدام اجرایی',
      'دسته‌بندی',
      'اولویت',
      'امتیاز اثرگذاری (۱ تا ۱۰)',
      'تیم مسئول',
      'وضعیت انجام',
    ];

    const rows = filteredTasks.map((t, index) => [
      index + 1,
      `"${t.task_title.replace(/"/g, '""')}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      PRIORITY_LABELS[t.priority].label,
      t.impact_score,
      TEAM_LABELS[t.assigned_team],
      t.is_completed ? 'انجام شده' : 'در انتظار اجرا',
    ]);

    const csvString =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seo-action-plan-${domain}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !onAddTask) return;
    await onAddTask({
      task_title: newTaskTitle.trim(),
      category: newCategory.trim() || 'سئو تکنیکال',
      priority: newPriority,
      impact_score: newImpact,
      assigned_team: newTeam,
    });
    setNewTaskTitle('');
    setShowAddRow(false);
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden print-avoid-break">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            نقشه راه اجرایی اولویت‌بندی‌شده (SEO Action Plan Roadmap)
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>مجموع اقدامات: {tasks.length.toLocaleString('fa-IR')} تسک</span>
            <span aria-hidden="true">·</span>
            <span>تکمیل‌شده: {completedCount.toLocaleString('fa-IR')}</span>
            <span aria-hidden="true">·</span>
            <span>مرتب‌سازی بر اساس امتیاز اثرگذاری (Impact Score)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          {!readOnly && onAddTask && (
            <button
              type="button"
              onClick={() => setShowAddRow(!showAddRow)}
              className="px-3.5 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن اقدام جدید</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>خروجی اکسل (CSV)</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>چاپ / دانلود PDF استاندارد A4</span>
          </button>
        </div>
      </div>

      {/* Interactive Segmented Filters */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">فیلتر اولویت:</span>
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            {(
              [
                { key: 'all', label: 'همه اولویت‌ها' },
                { key: 'high', label: 'فوری (High)' },
                { key: 'medium', label: 'متوسط (Medium)' },
                { key: 'low', label: 'پایین (Low)' },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPriorityFilter(item.key)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  priorityFilter === item.key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">فیلتر تیم اجرایی:</span>
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            {(
              [
                { key: 'all', label: 'همه تیم‌ها' },
                { key: 'technical', label: 'فنی (Technical)' },
                { key: 'content', label: 'محتوا (Content)' },
                { key: 'seo', label: 'سئو (SEO)' },
                { key: 'ui_ux', label: 'UI/UX' },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTeamFilter(item.key)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  teamFilter === item.key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add New Task Form */}
      {showAddRow && !readOnly && (
        <form
          onSubmit={handleCreateTask}
          className="p-4 bg-indigo-50/60 border-b border-indigo-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-end no-print"
        >
          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              عنوان تسک اجرایی
            </label>
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="مثال: بهینه‌سازی تگ‌های Canonical صفحات فیلتر..."
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              دسته‌بندی
            </label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              اولویت
            </label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as ActionPriority)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
            >
              <option value="high">فوری (High)</option>
              <option value="medium">متوسط (Medium)</option>
              <option value="low">پایین (Low)</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              اثر (۱-۱۰)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={newImpact}
              onChange={(e) => setNewImpact(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                تیم مسئول
              </label>
              <select
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value as AssignedTeam)}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="technical">فنی</option>
                <option value="content">محتوا</option>
                <option value="seo">سئو</option>
                <option value="ui_ux">UI/UX</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg whitespace-nowrap shrink-0 mt-5"
            >
              ثبت
            </button>
          </div>
        </form>
      )}

      {/* High-Density Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4 w-12 text-center">وضعیت</th>
              <th className="py-3 px-4">شرح اقدام اجرایی (Action Item)</th>
              <th className="py-3 px-4 w-40">دسته‌بندی</th>
              <th className="py-3 px-4 w-36">سطح اولویت</th>
              <th className="py-3 px-4 w-32 text-left">امتیاز اثرگذاری</th>
              <th className="py-3 px-4 w-44">تیم اجرایی مسئول</th>
              {!readOnly && onDeleteTask && (
                <th className="py-3 px-3 w-12 text-center no-print">حذف</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  هیچ اقدام اجرایی با فیلترهای انتخاب‌شده یافت نشد.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const prio = PRIORITY_LABELS[task.priority];
                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      task.is_completed ? 'bg-slate-50/50 text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        disabled={readOnly || !onToggleTask}
                        onClick={() =>
                          onToggleTask && onToggleTask(task.id, !task.is_completed)
                        }
                        className="text-slate-500 hover:text-indigo-600 disabled:cursor-default"
                        title={
                          task.is_completed ? 'علامت‌گذاری به عنوان ناتمام' : 'تکمیل تسک'
                        }
                      >
                        {task.is_completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 inline" />
                        ) : (
                          <Square className="w-4 h-4 inline" />
                        )}
                      </button>
                    </td>
                    <td
                      className={`py-3 px-4 font-medium leading-relaxed ${
                        task.is_completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.task_title}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {task.category}
                    </td>
                    <td className={`py-3 px-4 whitespace-nowrap ${prio.colorClass}`}>
                      {prio.label}
                    </td>
                    <td className="py-3 px-4 text-left font-mono tabular-nums font-semibold text-slate-900">
                      {task.impact_score} / 10
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {TEAM_LABELS[task.assigned_team]}
                    </td>
                    {!readOnly && onDeleteTask && (
                      <td className="py-3 px-3 text-center no-print">
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="حذف اقدام"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
