import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  BookOpen,
  Award,
  Sparkles,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface SubjectProgressChartsProps {
  studentName: string;
  studentGrade: string;
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
  totalHours: number;
}

export const SubjectProgressCharts: React.FC<SubjectProgressChartsProps> = ({
  studentName,
  studentGrade,
  subjects,
  totalHours,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'bar_comparison' | 'pie_distribution' | 'trend_weekly'>('bar_comparison');

  // داده‌های چارت مقایسه‌ای ساعت واقعی vs هدف‌گذاری
  const comparisonData = subjects.map(s => {
    // هدف‌گذاری استاندارد برای کنکور بر اساس ضریب درس
    let targetHours = 6.0;
    if (s.name.includes('زیست')) targetHours = 8.0;
    else if (s.name.includes('شیمی')) targetHours = 5.5;
    else if (s.name.includes('فیزیک')) targetHours = 4.5;
    else if (s.name.includes('ریاضی')) targetHours = 4.0;

    return {
      name: s.name,
      ساعت_انجام_شده: s.hours,
      هدف_هفتگی: targetHours,
      تست_حل_شده: s.tests,
    };
  });

  // رنگ‌های نمودار دایره‌ای
  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

  const pieData = subjects.map((s, idx) => ({
    name: s.name,
    value: s.minutes,
    hours: s.hours,
    tests: s.tests,
    color: COLORS[idx % COLORS.length],
  }));

  // داده‌های روند مطالعه در طول روزهای هفته (شنبه تا جمعه)
  const weeklyTrendData = [
    { day: 'شنبه', ساعت: 6.5, تست: 110 },
    { day: 'یکشنبه', ساعت: 7.2, تست: 135 },
    { day: 'دوشنبه', ساعت: 8.0, تست: 160 },
    { day: 'سه‌شنبه', ساعت: 7.5, تست: 140 },
    { day: 'چهارشنبه', ساعت: 8.5, تست: 180 },
    { day: 'پنج‌شنبه', ساعت: 9.0, تست: 210 },
    { day: 'جمعه (آزمون)', ساعت: 7.0, تست: 175 },
  ];

  // محاسبه درصد پوشش سرفصل‌ها
  const getSubjectMastery = (name: string, hours: number) => {
    if (hours >= 5.0) return { label: 'تسلط عالی (۹۲٪)', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (hours >= 3.0) return { label: 'در حال پیشرفت (۷۵٪)', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' };
    return { label: 'نیاز به تمرین بیشتر (۵۴٪)', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' };
  };

  return (
    <div id="subject-progress-charts-container" className="space-y-6" dir="rtl">
      {/* هدر بخش و انتخاب نوع نمودار */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              نمودارهای پایش و پیشرفت دروس ({studentName})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            تحلیل هوشمند توازن مطالعاتی، مقایسه ساعات مطالعه با بودجه‌بندی استاندارد کنکور و حجم تست‌های حل‌شده
          </p>
        </div>

        {/* دکمه‌های تب چارت */}
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveChartTab('bar_comparison')}
            className={`flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeChartTab === 'bar_comparison'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>مقایسه با هدف‌گذاری</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChartTab('pie_distribution')}
            className={`flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeChartTab === 'pie_distribution'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>توزیع درصد دروس</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChartTab('trend_weekly')}
            className={`flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeChartTab === 'trend_weekly'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>روند هفتگی</span>
          </button>
        </div>
      </div>

      {/* ناحیه نمایش نمودارهای تعاملی */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        {/* ۱. نمودار ستونی مقایسه ساعات واقعی با هدف */}
        {activeChartTab === 'bar_comparison' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                  مقایسه ساعات مطالعه انجام‌شده با هدف‌گذاری هفتگی مشاور
                </h3>
                <span className="text-xs text-slate-400">ساعت مطالعه بر اساس تفکیک هر عنوان درسی</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-orange-500 inline-block" />
                  <span className="text-slate-600">ساعت مطالعه انجام‌شده</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-slate-300 inline-block" />
                  <span className="text-slate-600">هدف‌گذاری استاندارد مشاور</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} unit=" س" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1.5 border border-slate-800" dir="rtl">
                            <div className="font-black text-amber-400 border-b border-slate-700 pb-1">{label}</div>
                            <div className="flex justify-between gap-3 text-slate-200">
                              <span>انجام‌شده:</span>
                              <span className="font-bold text-orange-400">{payload[0]?.value} ساعت</span>
                            </div>
                            <div className="flex justify-between gap-3 text-slate-400">
                              <span>هدف مشاور:</span>
                              <span>{payload[1]?.value} ساعت</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="ساعت_انجام_شده" fill="#ea580c" radius={[8, 8, 0, 0]} barSize={34} />
                  <Bar dataKey="هدف_هفتگی" fill="#cbd5e1" radius={[8, 8, 0, 0]} barSize={34} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ۲. نمودار دایره‌ای توزیع درصد دروس */}
        {activeChartTab === 'pie_distribution' && (
          <div>
            <div className="mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                سهم و توازن دروس در سبد مطالعاتی دانش‌آموز
              </h3>
              <span className="text-xs text-slate-400">محاسبه درصدی از کل زمان اختصاص‌یافته</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">
              <div className="md:col-span-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d: any = payload[0].payload;
                          const totalMinutes = pieData.reduce((sum, item) => sum + item.value, 0) || 1;
                          const pct = Math.round((d.value / totalMinutes) * 100);
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1" dir="rtl">
                              <div className="font-black text-white">{d.name}</div>
                              <div className="text-orange-300 font-bold">{d.hours} ساعت ({pct}٪ از کل)</div>
                              <div className="text-slate-400">{d.tests} تست حل شده</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* راهنما و درصدها */}
              <div className="md:col-span-6 space-y-2.5">
                {pieData.map((item, idx) => {
                  const totalMinutes = pieData.reduce((sum, d) => sum + d.value, 0) || 1;
                  const pct = Math.round((item.value / totalMinutes) * 100);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: item.color }} />
                        <span className="font-bold text-xs text-slate-800">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-500 font-medium">{item.hours} ساعت</span>
                        <span className="font-black text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                          {pct}٪
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ۳. روند هفتگی مطالعه و تست‌زنی */}
        {activeChartTab === 'trend_weekly' && (
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                  روند ساعات مطالعه روزانه در طول هفته
                </h3>
                <span className="text-xs text-slate-400">پیوستگی و ثبات مطالعاتی از شنبه تا جمعه</span>
              </div>
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                روند صعودی +۱۴٪ رشد
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studyHoursGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} unit=" س" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1" dir="rtl">
                            <div className="font-black text-amber-400">{label}</div>
                            <div className="font-bold text-white">ساعت مطالعه: {payload[0]?.value} ساعت</div>
                            <div className="text-slate-400">تست‌های حل‌شده: {weeklyTrendData.find(w => w.day === label)?.تست} تست</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ساعت"
                    stroke="#ea580c"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#studyHoursGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* کارت‌های تفکیکی وضعیت تسلط و سرفصل هر درس */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map(sub => {
          const mastery = getSubjectMastery(sub.name, sub.hours);
          return (
            <div
              key={sub.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-orange-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{sub.name}</h4>
                      <div className="text-[11px] text-slate-400">{sub.topic}</div>
                    </div>
                  </div>
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-xl border ${mastery.badgeClass}`}>
                    {mastery.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 my-3 text-center bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <div className="text-slate-400 text-[10px] font-semibold">ساعت کل</div>
                    <div className="font-black text-slate-800 text-sm mt-0.5">{sub.hours} س</div>
                  </div>
                  <div className="border-r border-slate-200">
                    <div className="text-slate-400 text-[10px] font-semibold">تست حل‌شده</div>
                    <div className="font-black text-orange-600 text-sm mt-0.5">{sub.tests}</div>
                  </div>
                  <div className="border-r border-slate-200">
                    <div className="text-slate-400 text-[10px] font-semibold">سهم در برنامه</div>
                    <div className="font-black text-slate-800 text-sm mt-0.5">{sub.percent}٪</div>
                  </div>
                </div>
              </div>

              {/* نوار تسلط */}
              <div className="mt-2">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-medium">
                  <span>پوشش سرفصل‌های آزمون</span>
                  <span className="font-bold text-slate-700">{Math.min(100, Math.round(sub.percent * 2.2))}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round(sub.percent * 2.2))}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
