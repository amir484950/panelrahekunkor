import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Save,
  Clock,
  Flame,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Plus,
  Trash2,
  Check,
  Award
} from 'lucide-react';
import { apiRequest } from '../../api';

interface RealtimeStudyTrackerProps {

  studentId: number;
  studentName: string;
  studyStats: {
    total_hours: number;
    today_hours: number;
    today_minutes: number;
    total_tests: number;
    streak_days: number;
    target_daily_hours: number;
  };
  subjects: Array<{
    id: string;
    name: string;
    minutes: number;
    hours: number;
    tests: number;
    percent: number;
    color: string;
    topic: string;
  }>;
  onLogSaved: () => void;
}

export const RealtimeStudyTracker: React.FC<RealtimeStudyTrackerProps> = ({
  studentId,
  studentName,
  studyStats,
  subjects,
  onLogSaved,
}) => {
  // تایمر زنده (کرونومتر آنلاین)
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [activeSubject, setActiveSubject] = useState<string>('زیست‌شناسی');
  const [activeTopic, setActiveTopic] = useState<string>('تنظیم اسمزی و بازجذب کلیه');
  const [studyMode, setStudyMode] = useState<'concept' | 'tests' | 'review'>('concept');
  const [testsCount, setTestsCount] = useState<number>(25);

  // فرم ثبت دستی
  const [manualMinutes, setManualMinutes] = useState<number>(90);
  const [manualSubject, setManualSubject] = useState<string>('زیست‌شناسی');
  const [manualTopic, setManualTopic] = useState<string>('تست زمان‌دار فصل دوم');
  const [manualTests, setManualTests] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // لاگ‌های امروز
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  // لود لاگ‌ها
  const loadLogs = async () => {
    try {
      setLoadingLogs(true);
      const data = await apiRequest<any>(`/rksp/v1/study-logs/me?student_id=${studentId}`);
      if (data && Array.isArray(data.logs)) {
        setTodayLogs(data.logs);
      }
    } catch (e) {
      console.error('Error loading study logs:', e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [studentId]);

  // حلقه تایمر زنده
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else if (!isTimerRunning && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // ذخیره جلسه تایمر زنده
  const handleSaveLiveSession = async () => {
    if (timerSeconds < 30) {
      alert('حداقل مدت زمان مطالعه برای ثبت باید ۳۰ ثانیه باشد.');
      return;
    }
    const minutes = Math.max(1, Math.round(timerSeconds / 60));
    setIsSubmitting(true);
    try {
      const modeLabel =
        studyMode === 'concept' ? 'مطالعه مفهومی' : studyMode === 'tests' ? 'تست‌زنی زمان‌دار' : 'مرور و جمع‌بندی';
      const subjectTitle = `${activeSubject} - ${activeTopic} (${modeLabel})`;

      const data = await apiRequest<{ success: boolean }>('/rksp/v1/study-logs', {
        method: 'POST',
        body: {
          student_id: studentId,
          minutes,
          subject: subjectTitle,
          source: 'live_timer',
        },
      });
      if (data.success) {
        setSuccessMessage(`جلسه زنده با موفقیت ثبت شد (${minutes} دقیقه).`);
        setTimerSeconds(0);
        setIsTimerRunning(false);
        onLogSaved();
        loadLogs();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch {
      alert('خطا در ذخیره جلسه مطالعه.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ثبت دستی
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualMinutes <= 0) return;
    setIsSubmitting(true);
    try {
      const subjectTitle = `${manualSubject} - ${manualTopic}${manualTests > 0 ? ` (${manualTests} تست)` : ''}`;
      const data = await apiRequest<{ success: boolean }>('/rksp/v1/study-logs', {
        method: 'POST',
        body: {
          student_id: studentId,
          minutes: Number(manualMinutes),
          subject: subjectTitle,
          source: 'panel',
        },
      });
      if (data.success) {
        setSuccessMessage(`ساعت مطالعه ${manualMinutes} دقیقه با موفقیت در سیستم ثبت شد.`);
        setManualTopic('');
        onLogSaved();
        loadLogs();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch {
      alert('خطا در ثبت ساعت مطالعه.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // حذف یک لاگ
  const handleDeleteLog = async (logId: number) => {
    if (!confirm('آیا از حذف این رکورد مطالعه مطمئن هستید؟')) return;
    try {
      const data = await apiRequest<{ success: boolean }>(`/rksp/v1/study-logs/${logId}`, { method: 'DELETE' });
      if (data.success) {
        setTodayLogs(prev => prev.filter(l => l.id !== logId));
        onLogSaved();
      }
    } catch (e) {
      console.error(e);
    }
  };


  const targetHours = studyStats.target_daily_hours || 8;
  const currentHours = studyStats.today_hours;
  const progressPercent = Math.min(100, Math.round((currentHours / targetHours) * 100));

  return (
    <div id="realtime-study-tracker-container" className="space-y-6" dir="rtl">
      {/* پیام موفقیت */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl p-4 flex items-center justify-between gap-3 text-sm font-semibold animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-emerald-700 hover:text-emerald-900 text-xs px-2 py-1 rounded-lg hover:bg-emerald-100"
          >
            بستن
          </button>
        </div>
      )}

      {/* خلاصه آماری زنده وضعیت روزانه دانش‌آموز */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ۱. پیشرفت هدف روزانه */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">ساعت مطالعه امروز</span>
            <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-black text-slate-900">{currentHours}</span>
              <span className="text-xs text-slate-400 font-semibold">از هدف {targetHours} ساعته</span>
            </div>
            {/* نوار پیشرفت */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-1.5">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
              <span>{progressPercent}٪ محقق شده</span>
              <span>{Math.max(0, +(targetHours - currentHours).toFixed(1))} ساعت مانده</span>
            </div>
          </div>
        </div>

        {/* ۲. تست‌های حل شده */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">تست‌های حل شده امروز</span>
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 mb-1">{studyStats.total_tests}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">~{Math.round(studyStats.total_tests / Math.max(1, currentHours))} تست/ساعت</span>
              <span className="text-slate-400">· سرعت استاندارد کنکور</span>
            </div>
          </div>
        </div>

        {/* ۳. زنجیره استمرار مطالعه */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">استمرار روزانه (Streak)</span>
            <span className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl font-black text-slate-900">{studyStats.streak_days}</span>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">روز متوالی 🔥</span>
            </div>
            <div className="text-xs text-slate-500">بدون وقفه در ارسال گزارش‌کار</div>
          </div>
        </div>

        {/* ۴. کل ساعات تجمعی سامانه */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">کل ساعات در راه کنکور</span>
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 mb-1">{studyStats.total_hours} <span className="text-sm font-bold text-slate-400">ساعت</span></div>
            <div className="text-xs text-slate-500">ثبت رسمی در پرونده تحصیلی مشاور</div>
          </div>
        </div>
      </div>

      {/* بخش اصلی: کرونومتر هوشمند زنده (Live Stopwatch) و ثبت دستی */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* پنل کرونومتر زنده */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col justify-between">
          {/* افکت پس‌زمینه */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <span className={`w-3 h-3 rounded-full ${isTimerRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <h3 className="text-base sm:text-lg font-black tracking-wide">
                  کرونومتر هوشمند مطالعه زنده
                </h3>
              </div>
              <span className="text-xs bg-white/10 text-orange-300 font-semibold px-3 py-1 rounded-full border border-white/10">
                {isTimerRunning ? 'در حال ثبت زمان زنده...' : 'آماده شروع مطالعه'}
              </span>
            </div>

            {/* صفحه نمایش بزرگ زمان */}
            <div className="my-6 text-center">
              <div className="text-5xl sm:text-7xl font-mono font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-300 drop-shadow-sm select-none">
                {formatTimer(timerSeconds)}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
                {timerSeconds === 0
                  ? 'درس و حالت مطالعه را انتخاب کرده و دکمه شروع را بزنید'
                  : `در حال مطالعه: ${activeSubject} (${activeTopic})`}
              </p>
            </div>

            {/* انتخاب درس، مبحث و نوع مطالعه برای جلسه جاری */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 bg-white/5 border border-white/10 p-3.5 rounded-2xl text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">درس:</label>
                <select
                  value={activeSubject}
                  onChange={e => setActiveSubject(e.target.value)}
                  disabled={isTimerRunning}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-orange-400"
                >
                  <option value="زیست‌شناسی">زیست‌شناسی</option>
                  <option value="شیمی">شیمی</option>
                  <option value="فیزیک">فیزیک</option>
                  <option value="ریاضیات">ریاضیات</option>
                  <option value="ادبیات و عمومی">ادبیات و عمومی</option>
                  <option value="آزمون آزمایشی">آزمون آزمایشی جامع</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">مبحث / فصل:</label>
                <input
                  type="text"
                  value={activeTopic}
                  onChange={e => setActiveTopic(e.target.value)}
                  disabled={isTimerRunning}
                  placeholder="مثلاً ژنتیک، حد و پیوستگی..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-orange-400 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">حالت مطالعه:</label>
                <select
                  value={studyMode}
                  onChange={e => setStudyMode(e.target.value as any)}
                  disabled={isTimerRunning}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-orange-400"
                >
                  <option value="concept">مطالعه مفهومی و کتاب</option>
                  <option value="tests">تست‌زنی زمان‌دار</option>
                  <option value="review">مرور و خلاصه‌نویسی</option>
                </select>
              </div>
            </div>
          </div>

          {/* دکمه‌های کنترل کرونومتر */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
            {!isTimerRunning ? (
              <button
                type="button"
                onClick={() => setIsTimerRunning(true)}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{timerSeconds === 0 ? 'شروع مطالعه زنده' : 'ادامه تایمر'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsTimerRunning(false)}
                className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-all"
              >
                <Pause className="w-5 h-5 fill-current" />
                <span>توقف موقت (Pause)</span>
              </button>
            )}

            {timerSeconds > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleSaveLiveSession}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'در حال ثبت...' : 'ثبت آنی در باشگاه'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('آیا مایلید کرونومتر بدون ثبت صفر شود؟')) {
                      setIsTimerRunning(false);
                      setTimerSeconds(0);
                    }
                  }}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-all"
                  title="تنظیم مجدد"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* پنل ثبت دستی سریع ساعت مطالعه */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-600" />
                <span>ثبت سریع ساعت مطالعه انجام‌شده</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-semibold">باکس مطالعاتی</span>
            </div>

            {/* دکمه‌های پیش‌فرض سریع زمان */}
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-600 block mb-2">انتخاب سریع مدت زمان:</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[45, 60, 90, 120, 150].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setManualMinutes(mins)}
                    className={`py-2 text-xs font-extrabold rounded-xl transition-all border ${
                      manualMinutes === mins
                        ? 'bg-orange-50 text-orange-600 border-orange-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mins >= 60 ? `${(mins / 60).toFixed(1)} س` : `${mins} د`}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">دقیقه مطالعه:</label>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    step="5"
                    value={manualMinutes}
                    onChange={e => setManualMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">تعداد تست حل‌شده:</label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={manualTests}
                    onChange={e => setManualTests(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">درس:</label>
                <select
                  value={manualSubject}
                  onChange={e => setManualSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-orange-500"
                >
                  <option value="زیست‌شناسی">زیست‌شناسی</option>
                  <option value="شیمی">شیمی</option>
                  <option value="فیزیک">فیزیک</option>
                  <option value="ریاضیات">ریاضیات</option>
                  <option value="ادبیات فارسی">ادبیات فارسی</option>
                  <option value="عربی و زبان">عربی و زبان انگلیسی</option>
                  <option value="دینی و فلسفه">دین و زندگی / فلسفه و منطق</option>
                  <option value="آزمون خودسنجی">آزمون خودسنجی و تحلیل</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">مبحث یا توضیحات:</label>
                <input
                  type="text"
                  placeholder="مثال: تست‌های کنکور سراسری، خلاصه نویسی..."
                  value={manualTopic}
                  onChange={e => setManualTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'در حال ثبت...' : 'ثبت ساعت در پرونده تحصیلی'}</span>
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            مشاور تحصیلی شما گزارش‌های ثبت‌شده را به صورت لحظه‌ای پایش می‌کند.
          </div>
        </div>
      </div>

      {/* تایم‌لاین جلسات ثبت‌شده امروز برای دانش‌آموز فعال */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
              گزارش زنده جلسات مطالعاتی ثبت‌شده امروز ({studentName})
            </h3>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-xl">
            {todayLogs.length} باکس ثبت‌شده
          </span>
        </div>

        {todayLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            هنوز برای امروز جلسه مطالعه‌ای ثبت نکرده‌اید. با کرونومتر بالا یا فرم ثبت سریع، اولین جلسه خود را اضافه کنید.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayLogs.map(log => {
              const hours = +(log.minutes / 60).toFixed(1);
              return (
                <div
                  key={log.id}
                  className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {hours} س
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-800">
                        {log.subject || 'مطالعه روزانه'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{log.log_date}</span>
                        <span>·</span>
                        <span>{log.minutes} دقیقه</span>
                        <span>·</span>
                        <span className="text-slate-500 font-medium">
                          {log.source === 'live_timer' ? 'ثبت شده با کرونومتر هوشمند' : 'ثبت مستقیم'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      تایید شده
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-all"
                      title="حذف لاگ"
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
    </div>
  );
};
