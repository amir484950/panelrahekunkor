import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Flag,
  Phone,
  BookOpen,
  Sparkles,
  Check,
  Trash2,
  X,
  Target
} from 'lucide-react';
import { MilestoneItem } from '../../types';
import { apiRequest } from '../../api';

interface MilestonesCalendarViewProps {
  studentId: number;
  studentName: string;
}

export const MilestonesCalendarView: React.FC<MilestonesCalendarViewProps> = ({
  studentId,
  studentName,
}) => {
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterCategory, setFilterCategory] = useState<'all' | 'exam' | 'task' | 'consultation' | 'curriculum'>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // فرم افزودن نقطه عطف جدید
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'exam' | 'task' | 'consultation' | 'curriculum'>('exam');
  const [newDate, setNewDate] = useState<string>('2026-09-25');
  const [newPersianDate, setNewPersianDate] = useState<string>('۳ مهر ۱۴۰۵');
  const [newTime, setNewTime] = useState<string>('۰۸:۳۰');
  const [newImportance, setNewImportance] = useState<'high' | 'medium' | 'low'>('high');
  const [newDescription, setNewDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // بارگذاری نقاط عطف از API
  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<MilestoneItem[]>(`/rksp/v1/milestones?student_id=${studentId}`);
      if (Array.isArray(data)) {
        setMilestones(data);
      }
    } catch (e) {
      console.error('Error fetching milestones:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [studentId]);

  // تغییر وضعیت انجام شد/در انتظار
  const handleToggleStatus = async (id: number, currentStatus: 'upcoming' | 'completed') => {
    const nextStatus = currentStatus === 'upcoming' ? 'completed' : 'upcoming';
    try {
      const data = await apiRequest<{ success: boolean }>(`/rksp/v1/milestones/${id}`, {
        method: 'PATCH',
        body: { status: nextStatus },
      });
      if (data.success) {
        setMilestones(prev => prev.map(m => (m.id === id ? { ...m, status: nextStatus } : m)));
      }
    } catch (e) {
      console.error('Error updating milestone:', e);
    }
  };

  // حذف نقطه عطف
  const handleDeleteMilestone = async (id: number) => {
    if (!confirm('آیا از حذف این رویداد / نقطه عطف اطمینان دارید؟')) return;
    try {
      const data = await apiRequest<{ success: boolean }>(`/rksp/v1/milestones/${id}`, { method: 'DELETE' });
      if (data.success) {
        setMilestones(prev => prev.filter(m => m.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // افزودن نقطه عطف جدید
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;
    setIsSubmitting(true);
    try {
      const data = await apiRequest<{ success: boolean; milestone: MilestoneItem }>('/rksp/v1/milestones', {
        method: 'POST',
        body: {
          student_id: studentId,
          title: newTitle,
          category: newCategory,
          date: newDate,
          persian_date: newPersianDate || newDate,
          time: newTime,
          importance: newImportance,
          description: newDescription,
        },
      });
      if (data.success) {
        setMilestones(prev => [...prev, data.milestone].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

        setShowAddModal(false);
        setNewTitle('');
        setNewDescription('');
      }
    } catch {
      alert('خطا در ذخیره رویداد جدید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ساخت روزهای تقویم ماه جاری (شهریور / مهر ۱۴۰۵ - سپتامبر ۲۰۲۶)
  // ۱ سپتامبر ۲۰۲۶ سه‌شنبه است. در تقویم شمسی ماه شهریور ۳۱ روز دارد.
  const calendarDays = [
    { dayNumber: 1, dateStr: '2026-09-01', dayOfWeek: 'سه‌شنبه' },
    { dayNumber: 2, dateStr: '2026-09-02', dayOfWeek: 'چهارشنبه' },
    { dayNumber: 3, dateStr: '2026-09-03', dayOfWeek: 'پنج‌شنبه' },
    { dayNumber: 4, dateStr: '2026-09-04', dayOfWeek: 'جمعه' },
    { dayNumber: 5, dateStr: '2026-09-05', dayOfWeek: 'شنبه' },
    { dayNumber: 6, dateStr: '2026-09-06', dayOfWeek: 'یکشنبه' },
    { dayNumber: 7, dateStr: '2026-09-07', dayOfWeek: 'دوشنبه' },
    { dayNumber: 8, dateStr: '2026-09-08', dayOfWeek: 'سه‌شنبه' },
    { dayNumber: 9, dateStr: '2026-09-09', dayOfWeek: 'چهارشنبه' },
    { dayNumber: 10, dateStr: '2026-09-10', dayOfWeek: 'پنج‌شنبه' },
    { dayNumber: 11, dateStr: '2026-09-11', dayOfWeek: 'جمعه' },
    { dayNumber: 12, dateStr: '2026-09-12', dayOfWeek: 'شنبه' },
    { dayNumber: 13, dateStr: '2026-09-13', dayOfWeek: 'یکشنبه', isToday: true },
    { dayNumber: 14, dateStr: '2026-09-14', dayOfWeek: 'دوشنبه' },
    { dayNumber: 15, dateStr: '2026-09-15', dayOfWeek: 'سه‌شنبه' },
    { dayNumber: 16, dateStr: '2026-09-16', dayOfWeek: 'چهارشنبه' },
    { dayNumber: 17, dateStr: '2026-09-17', dayOfWeek: 'پنج‌شنبه' },
    { dayNumber: 18, dateStr: '2026-09-18', dayOfWeek: 'جمعه' },
    { dayNumber: 19, dateStr: '2026-09-19', dayOfWeek: 'شنبه' },
    { dayNumber: 20, dateStr: '2026-09-20', dayOfWeek: 'یکشنبه' },
    { dayNumber: 21, dateStr: '2026-09-21', dayOfWeek: 'دوشنبه' },
    { dayNumber: 22, dateStr: '2026-09-22', dayOfWeek: 'سه‌شنبه' },
    { dayNumber: 23, dateStr: '2026-09-23', dayOfWeek: 'چهارشنبه' },
    { dayNumber: 24, dateStr: '2026-09-24', dayOfWeek: 'پنج‌شنبه' },
    { dayNumber: 25, dateStr: '2026-09-25', dayOfWeek: 'جمعه' },
    { dayNumber: 26, dateStr: '2026-09-26', dayOfWeek: 'شنبه' },
    { dayNumber: 27, dateStr: '2026-09-27', dayOfWeek: 'یکشنبه' },
    { dayNumber: 28, dateStr: '2026-09-28', dayOfWeek: 'دوشنبه' },
    { dayNumber: 29, dateStr: '2026-09-29', dayOfWeek: 'سه‌شنبه' },
    { dayNumber: 30, dateStr: '2026-09-30', dayOfWeek: 'چهارشنبه' },
  ];

  // محاسبه تعداد روز مانده تا رویداد
  const getDaysRemaining = (dateStr: string) => {
    const today = new Date('2026-09-13').getTime();
    const eventDate = new Date(dateStr).getTime();
    const diff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'امروز ⚡';
    if (diff === 1) return 'فردا';
    if (diff > 1) return `${diff} روز مانده`;
    return 'گذشته';
  };

  // فیلتر کردن
  const filteredMilestones = milestones.filter(m => {
    const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
    const matchesDate = !selectedDate || m.date === selectedDate;
    return matchesCategory && matchesDate;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'exam':
        return { label: 'آزمون آزمایشی', bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
      case 'task':
        return { label: 'تکلیف و گزارش‌کار', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
      case 'consultation':
        return { label: 'جلسه مشاوره', bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' };
      case 'curriculum':
      default:
        return { label: 'نقطه عطف درسی', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
    }
  };

  return (
    <div id="milestones-calendar-view-container" className="space-y-6" dir="rtl">
      {/* هدر بخش تقویم و دکمه افزودن */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              تقویم و نقاط عطف آموزشی ({studentName})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            زمان‌بندی آزمون‌های آزمایشی، مهلت تکالیف مشاور، جلسات آنلاین و تاریخ‌های کلیدی کنکور سراسری
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>نمایش همه روزها</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن نقطه عطف جدید</span>
          </button>
        </div>
      </div>

      {/* تقویم ماهانه تعاملی */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-sm sm:text-base font-black text-slate-900">
              شهریور ۱۴۰۵ / سپتامبر ۲۰۲۶
            </span>
            <span className="text-xs text-orange-600 bg-orange-50 font-bold px-2.5 py-0.5 rounded-lg border border-orange-200">
              سال تحصیلی کنکور
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedDate('2026-09-13')}
              className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              امروز
            </button>
            <button
              type="button"
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              title="ماه قبل"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              title="ماه بعد"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* سربرگ روزهای هفته (شنبه تا جمعه) */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-slate-400 mb-2">
          <span>ش</span>
          <span>ی</span>
          <span>د</span>
          <span>س</span>
          <span>چ</span>
          <span>پ</span>
          <span className="text-red-400">ج</span>
        </div>

        {/* شبکه‌بندی خانه‌های روز تقویم */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* فاصله خالی ابتدای ماه تا سه‌شنبه */}
          <div className="h-14 sm:h-20 bg-slate-50/50 rounded-2xl border border-transparent" />
          <div className="h-14 sm:h-20 bg-slate-50/50 rounded-2xl border border-transparent" />
          <div className="h-14 sm:h-20 bg-slate-50/50 rounded-2xl border border-transparent" />

          {calendarDays.map(day => {
            const dayEvents = milestones.filter(m => m.date === day.dateStr);
            const isSelected = selectedDate === day.dateStr;

            return (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => setSelectedDate(isSelected ? null : day.dateStr)}
                className={`h-14 sm:h-20 p-1.5 sm:p-2 rounded-2xl border text-right transition-all flex flex-col justify-between relative group ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/80 shadow-xs'
                    : day.isToday
                    ? 'border-amber-400 bg-amber-50/50'
                    : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-black ${
                      day.isToday
                        ? 'w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]'
                        : isSelected
                        ? 'text-orange-600'
                        : 'text-slate-800'
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                  {day.isToday && (
                    <span className="hidden sm:inline-block text-[9px] font-bold text-orange-600">امروز</span>
                  )}
                </div>

                {/* نشانگر رویدادها در این روز */}
                {dayEvents.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 w-full mt-auto">
                    {dayEvents.map(evt => {
                      const badge = getCategoryBadge(evt.category);
                      return (
                        <div
                          key={evt.id}
                          className="w-full flex items-center gap-1 text-[9px] font-bold truncate rounded-md px-1 py-0.5 bg-slate-100/90 text-slate-700"
                          title={evt.title}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                          <span className="hidden sm:inline truncate">{evt.title}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* راهنمای رنگ‌های تقویم */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-5 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>آزمون‌های آزمایشی</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>تکالیف و ددلاین‌ها</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>جلسات مشاوره تلفنی</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>نقاط عطف سرفصل‌ها</span>
          </div>
        </div>
      </div>

      {/* فیلتر تب‌های دسته‌بندی */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'all', label: `همه رویدادها (${milestones.length})` },
          { id: 'exam', label: `آزمون‌های آزمایشی (${milestones.filter(m => m.category === 'exam').length})` },
          { id: 'task', label: `تکالیف مشاور (${milestones.filter(m => m.category === 'task').length})` },
          { id: 'consultation', label: `جلسات آنلاین و تلفنی (${milestones.filter(m => m.category === 'consultation').length})` },
          { id: 'curriculum', label: `نقاط عطف بودجه‌بندی (${milestones.filter(m => m.category === 'curriculum').length})` },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterCategory(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              filterCategory === tab.id
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* لیست رویدادها و نقاط عطف پیش‌رو */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-600" />
            <span>
              {selectedDate
                ? `نقاط عطف انتخاب‌شده برای تاریخ ${selectedDate}`
                : 'فهرست رویدادها و نقاط عطف پیش‌رو'}
            </span>
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            {filteredMilestones.length} رویداد
          </span>
        </div>

        {filteredMilestones.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            هیچ نقطه عطفی برای این فیلتر یا تاریخ یافت نشد. می‌توانید با دکمه بالا رویداد جدیدی اضافه کنید.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMilestones.map(m => {
              const badge = getCategoryBadge(m.category);
              const countdown = getDaysRemaining(m.date);
              const isDone = m.status === 'completed';

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-slate-50/60 border-slate-200 opacity-80'
                      : 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(m.id, m.status)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center mt-0.5 transition-all ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-orange-500 text-transparent'
                      }`}
                      title={isDone ? 'علامت‌گذاری به عنوان در انتظار' : 'تکمیل شد'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-lg border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <h4
                          className={`font-black text-sm text-slate-900 ${
                            isDone ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {m.title}
                        </h4>
                      </div>

                      {m.description && (
                        <p className="text-xs text-slate-500 mb-1 max-w-xl">
                          {m.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {m.persian_date} ({m.date})
                        </span>
                        {m.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ساعت {m.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-xl border ${
                        isDone
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : countdown.includes('امروز')
                          ? 'bg-red-500 text-white border-red-500 animate-pulse'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}
                    >
                      {isDone ? 'پاس شد ✓' : countdown}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteMilestone(m.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-all"
                      title="حذف رویداد"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* مدال افزودن نقطه عطف جدید */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-600" />
                <span>افزودن رویداد یا نقطه عطف جدید</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">عنوان نقطه عطف / آزمون:</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً آزمون جامع مرحله دوم، ددلاین ارسال خلاصه نویسی..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">دسته‌بندی:</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="exam">آزمون آزمایشی</option>
                    <option value="task">تکلیف / ددلاین</option>
                    <option value="consultation">جلسه مشاوره</option>
                    <option value="curriculum">نقطه عطف سرفصل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">درجه اهمیت:</label>
                  <select
                    value={newImportance}
                    onChange={e => setNewImportance(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="high">بسیار مهم (High)</option>
                    <option value="medium">متوسط (Medium)</option>
                    <option value="low">عادی (Low)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">تاریخ میلادی:</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">ساعت برگزاری:</label>
                  <input
                    type="text"
                    placeholder="مثلاً ۰۸:۳۰"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">عنوان تاریخ شمسی:</label>
                <input
                  type="text"
                  placeholder="مثلاً ۴ مهر ۱۴۰۵"
                  value={newPersianDate}
                  onChange={e => setNewPersianDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">توضیحات و بودجه‌بندی (اختیاری):</label>
                <textarea
                  rows={3}
                  placeholder="مباحث مطرح، دفترچه سوالات، فایل پاسخنامه..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'در حال ثبت...' : 'ثبت در تقویم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
