import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  Clock,
  Calendar,
  UserPlus,
  RefreshCw,
  Phone,
  CheckCircle2,
  ExternalLink,
  Settings,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { ChannelItem, PlanItem } from '../types';
import { RegistrationAndConnectionHub } from './RegistrationAndConnectionHub';
import { apiRequest } from '../api';
import { ErrorState } from './common/DataStateDisplay';

export const AdminDashboard: React.FC = () => {

  const [adminSection, setAdminSection] = useState<'3steps_hub' | 'darsbama_metrics'>('3steps_hub');
  const [stats, setStats] = useState({
    total_students: 0,
    unassigned_count: 0,
    expiring_plans: 0,
    active_mentors: 0,
  });
  const [plansTable, setPlansTable] = useState<any[]>([]);
  const [mentorsWorkload, setMentorsWorkload] = useState<any[]>([]);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // فرم تخصیص مشاور
  const [assignStudentId, setAssignStudentId] = useState(114);
  const [assignMentorId, setAssignMentorId] = useState(2);
  const [assignMsg, setAssignMsg] = useState('');

  // فرم افزودن/تمدید طرح
  const [renewStudentId, setRenewStudentId] = useState(115);
  const [renewPlanName, setRenewPlanName] = useState('۱ ماه مشاوره VIP پلاس');
  const [renewEndDate, setRenewEndDate] = useState('2026-10-15');
  const [renewMsg, setRenewMsg] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const data = await apiRequest<any>('/rksp/v1/admin/overview');
      if (data) {
        setStats(data.stats || {});
        setPlansTable(data.expiring_plans_table || []);
        setMentorsWorkload(data.mentors_workload || []);
      }

      try {
        const chData = await apiRequest<any[]>('/rksp/v1/channels');
        setChannels(chData || []);
      } catch {}
    } catch (e: any) {
      console.error(e);
      setFetchError(e?.message || 'خطا در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAssignMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiRequest<any>('/rksp/v1/admin/assign-mentor', {
        method: 'POST',
        body: { student_id: assignStudentId, mentor_id: assignMentorId },
      });
      if (data && data.success) {
        setAssignMsg('مشاور با موفقیت به دانش‌آموز اختصاص یافت.');
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRenewPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiRequest<any>('/rksp/v1/admin/plans', {
        method: 'POST',
        body: {
          student_id: renewStudentId,
          plan_name: renewPlanName,
          price: 1800000,
          start_date: new Date().toISOString().split('T')[0],
          end_date: renewEndDate,
        },
      });
      if (data && data.success) {
        setRenewMsg('طرح با موفقیت تمدید و فعال شد.');
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* هدر پیشخوان وردپرس */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white text-[11px] font-mono px-2 py-0.5 rounded font-bold">
              WP Admin
            </span>
            <h1 className="text-xl font-black text-slate-900">
              پیشخوان نظارتی پرتال راه کنکور (منطبق بر پنل درسباما)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            مشاهده شاخص‌های کلیدی، مانیتورینگ تاریخ انقضای مشاوره‌ها، انتساب خودکار و مدیریت کانال‌های ارتباطی
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAdminData}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>به‌روزرسانی داده‌ها</span>
        </button>
      </div>

      {/* سوییچر بخش‌های پیشخوان مدیر */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setAdminSection('3steps_hub')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            adminSection === '3steps_hub'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>چرخه ۳ مرحله‌ای (ثبت‌نام، اتصال و نظارت عملکرد)</span>
          <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">بخش اصلی</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSection('darsbama_metrics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            adminSection === 'darsbama_metrics'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>شاخص‌های انقضای اشتراک‌ها و گزارش‌های درسباما</span>
        </button>
      </div>

      {/* حالت اول: چرخه ۳ مرحله‌ای و نظارت مدیر */}
      {adminSection === '3steps_hub' && (
        <RegistrationAndConnectionHub />
      )}

      {/* حالت دوم: شاخص‌های اشتراک‌ها و لاگ‌های درسباما */}
      {adminSection === 'darsbama_metrics' && (
        fetchError ? (
          <ErrorState onRetry={fetchAdminData} message={fetchError} />
        ) : (
        <div className="space-y-6">
      {/* کارت‌های آمار بالای صفحه (دقیقاً مشابه عکس ۱۰ درسباما) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">دانش‌آموزان فعال</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.total_students}</div>
          <div className="text-[11px] text-slate-400 mt-1">ثبت‌شده در جدول اختصاصی</div>
        </div>

        <div className={`border rounded-2xl p-5 shadow-xs ${stats.unassigned_count > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className={`text-xs font-bold ${stats.unassigned_count > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
              دانش‌آموزان بدون مشاور
            </span>
            <AlertTriangle className={`w-4 h-4 ${stats.unassigned_count > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-3xl font-black ${stats.unassigned_count > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {stats.unassigned_count}
          </div>
          <div className="text-[11px] text-rose-600/80 font-semibold mt-1">نیاز به تخصیص سریع مشاور</div>
        </div>

        <div className={`border rounded-2xl p-5 shadow-xs ${stats.expiring_plans > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className={`text-xs font-bold ${stats.expiring_plans > 0 ? 'text-amber-800' : 'text-slate-500'}`}>
              طرح‌های روبه‌انقضا (۷ روز آینده)
            </span>
            <Clock className={`w-4 h-4 ${stats.expiring_plans > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-3xl font-black ${stats.expiring_plans > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {stats.expiring_plans}
          </div>
          <div className="text-[11px] text-amber-700/80 font-semibold mt-1">فرصت تماس جهت تمدید دوره</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">تعداد مشاوران سیستم</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.active_mentors}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">نقش کاربری `rksp_mentor`</div>
        </div>
      </div>

      {/* جدول طرح‌های روبه‌انقضا (مطابق اسکرین‌شات ۱۰) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-slate-900">طرح‌های مشاوره نزدیک به انقضا</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              لیست دانش‌آموزانی که مهلت مشاوره آن‌ها منقضی شده یا ظرف روزهای آینده به پایان می‌رسد (منطبق بر عکس ۱۰)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">دانش‌آموز</th>
                <th className="p-3">شماره تماس</th>
                <th className="p-3">طرح مشاوره</th>
                <th className="p-3">مشاور اختصاصی</th>
                <th className="p-3">تاریخ پایان</th>
                <th className="p-3">وضعیت و مهلت</th>
                <th className="p-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plansTable.map((p, idx) => {
                const isExpired = p.days_left < 0;
                const isExpiring = p.days_left >= 0 && p.days_left <= 7;

                let badgeClass = 'bg-emerald-100 text-emerald-800';
                let label = `${p.days_left} روز باقیمانده`;

                if (isExpired) {
                  badgeClass = 'bg-rose-100 text-rose-800 font-bold';
                  label = 'منقضی شده';
                } else if (isExpiring) {
                  badgeClass = 'bg-amber-100 text-amber-800 font-bold';
                  label = `${p.days_left} روز باقیمانده`;
                }

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{p.student_name}</td>
                    <td className="p-3 font-mono text-slate-600 text-xs" dir="ltr">{p.phone}</td>
                    <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">{p.plan_name}</td>
                    <td className="p-3 whitespace-nowrap">
                      {p.mentor_name.includes('بدون') ? (
                        <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
                          {p.mentor_name}
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-800">{p.mentor_name}</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-600 text-xs whitespace-nowrap">{p.end_date}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${badgeClass}`}>
                        {label}
                      </span>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setRenewStudentId(p.student_id);
                          setRenewPlanName(p.plan_name);
                        }}
                        className="text-xs font-bold text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-lg transition-colors"
                      >
                        تمدید طرح
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* دو ابزار مدیریتی: تخصیص مشاور + تمدید طرح */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* فرم تخصیص مشاور */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-orange-600" />
            تخصیص یا تغییر مشاور اختصاصی
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            ثبت در جدول تاریخچه‌دار <code className="bg-slate-100 px-1 py-0.5 rounded">wp_rksp_assignments</code> با قابلیت ثبت پایان مشاوره قبلی
          </p>

          <form onSubmit={handleAssignMentor} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">دانش‌آموز</label>
              <select
                value={assignStudentId}
                onChange={e => setAssignStudentId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold outline-none"
              >
                <option value={114}>دانش‌آموز ۱۴ (دوازدهم انسانی - بدون مشاور)</option>
                <option value={115}>دانش‌آموز ۱۵ (دوازدهم تجربی - بدون مشاور)</option>
                <option value={113}>دانش‌آموز ۱۳ (یازدهم تجربی)</option>
                <option value={101}>دانش‌آموز ۱ (دوازدهم تجربی)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مشاور انتخابی</label>
              <select
                value={assignMentorId}
                onChange={e => setAssignMentorId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold outline-none"
              >
                <option value={2}>مشاور تحصیلی ۱ (۴ دانش‌آموز فعال)</option>
                <option value={3}>مشاور تحصیلی ۲ (۲ دانش‌آموز فعال)</option>
                <option value={4}>مشاور تحصیلی ۳ (۳ دانش‌آموز فعال)</option>
                <option value={5}>مشاور تحصیلی ۴ (۱ دانش‌آموز فعال)</option>
                <option value={6}>مشاور تحصیلی ۵ (۲ دانش‌آموز فعال)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors text-sm"
            >
              ثبت انتساب مشاور
            </button>

            {assignMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                {assignMsg}
              </div>
            )}
          </form>
        </div>

        {/* فرم تمدید طرح */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            تمدید یا ثبت طرح مشاوره جدید
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            ثبت در جدول <code className="bg-slate-100 px-1 py-0.5 rounded">wp_rksp_plans</code> با اعمال تاریخ انقضای جدید
          </p>

          <form onSubmit={handleRenewPlan} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">دانش‌آموز</label>
              <select
                value={renewStudentId}
                onChange={e => setRenewStudentId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold outline-none"
              >
                <option value={115}>دانش‌آموز ۱۵ (منقضی شده)</option>
                <option value={114}>دانش‌آموز ۱۴ (منقضی شده)</option>
                <option value={110}>دانش‌آموز ۱۰ (۱ روز مانده)</option>
                <option value={111}>دانش‌آموز ۱۱ (۳ روز مانده)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">طرح</label>
                <input
                  type="text"
                  value={renewPlanName}
                  onChange={e => setRenewPlanName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تاریخ پایان جدید</label>
                <input
                  type="date"
                  value={renewEndDate}
                  onChange={e => setRenewEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors text-sm"
            >
              تمدید و فعال‌سازی فوری طرح
            </button>

            {renewMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                {renewMsg}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* بخش برگه‌های خودکار وردپرس و سازگاری گوتنبرگ (بدون المنتور) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-[11px] font-black px-2 py-0.5 rounded font-mono">
                WordPress Core Native
              </span>
              <h3 className="text-base font-black text-slate-900">
                برگه‌های استاندارد ساخته‌شده در هسته وردپرس (بدون نیاز به المنتور)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              در زمان فعال‌سازی افزونه، این ۴ برگه مستقیماً در جدول برگه‌های وردپرس ایجاد شده و با قالب‌های پیش‌فرض و ویرایشگر گوتنبرگ کار می‌کنند.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">برگه پرتال</span>
              <h4 className="text-sm font-bold text-slate-900 mt-2">پرتال دانش‌آموز</h4>
              <p className="text-xs text-slate-500 mt-1">ثبت ساعت مطالعه، تکالیف و نظرات مشاور</p>
              <div className="text-[11px] font-mono text-slate-400 mt-2" dir="ltr">/student-portal/</div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-600 font-mono">
              بلاک: <code>rksp/student-portal</code>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">برگه پرتال</span>
              <h4 className="text-sm font-bold text-slate-900 mt-2">پرتال مشاور تحصیلی</h4>
              <p className="text-xs text-slate-500 mt-1">مدیریت پرونده دانش‌آموزان اختصاصی و گزارش کار</p>
              <div className="text-[11px] font-mono text-slate-400 mt-2" dir="ltr">/mentor-portal/</div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-600 font-mono">
              بلاک: <code>rksp/mentor-portal</code>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">برگه رتبه‌بندی</span>
              <h4 className="text-sm font-bold text-slate-900 mt-2">باشگاه ساعت مطالعه</h4>
              <p className="text-xs text-slate-500 mt-1">لیدربورد زنده با کش ۵ دقیقه‌ای ترنزینت</p>
              <div className="text-[11px] font-mono text-slate-400 mt-2" dir="ltr">/study-leaderboard/</div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-600 font-mono">
              بلاک: <code>rksp/leaderboard</code>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">برگه پیشرفت</span>
              <h4 className="text-sm font-bold text-slate-900 mt-2">باشگاه پیشرفت و افتخارات</h4>
              <p className="text-xs text-slate-500 mt-1">فید دستاوردها و رکوردهای مطالعاتی</p>
              <div className="text-[11px] font-mono text-slate-400 mt-2" dir="ltr">/study-achievements/</div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-600 font-mono">
              بلاک: <code>rksp/achievements</code>
            </div>
          </div>
        </div>
      </div>
      </div>
      )
      )}
    </div>
  );
};
