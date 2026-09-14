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
  Send,
  UserCheck
} from 'lucide-react';
import { ChannelItem } from '../types';
import { api } from '../api';
import { ErrorState } from './common/DataStateDisplay';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [stats, setStats] = useState({
    total_students: 24,
    unassigned_count: 3,
    expiring_plans: 5,
    active_mentors: 6,
  });
  const [plansTable, setPlansTable] = useState<any[]>([
    {
      id: 1,
      student_id: 110,
      student_name: 'علیرضا راد',
      phone: '09121110001',
      mentor_name: 'دکتر کاظمی',
      plan_name: '۳ ماهه کنکور تیر',
      end_date: '2026-09-16',
      days_left: 1,
      is_expiring: true,
      status: 'active'
    },
    {
      id: 2,
      student_id: 111,
      student_name: 'سارا حسینی',
      phone: '09121110002',
      mentor_name: 'مهندس رضایی',
      plan_name: '۱ ماهه تخصصی VIP',
      end_date: '2026-09-18',
      days_left: 3,
      is_expiring: true,
      status: 'active'
    },
    {
      id: 3,
      student_id: 114,
      student_name: 'امیرحسین عباسی',
      phone: '09121110005',
      mentor_name: 'بدون مشاور',
      plan_name: 'مشاوره ماهانه',
      end_date: '2026-09-10',
      days_left: -4,
      is_expired: true,
      status: 'expired'
    }
  ]);
  const [mentorsWorkload, setMentorsWorkload] = useState<any[]>([
    { id: 2, name: 'دکتر کاظمی', specialty: 'ریاضی و فیزیک', student_count: 5, capacity: 8 },
    { id: 3, name: 'مهندس رضایی', specialty: 'تجربی و زیست‌شناسی', student_count: 4, capacity: 6 },
    { id: 4, name: 'خانم علیزاده', specialty: 'انسانی و دروس عمومی', student_count: 3, capacity: 6 },
  ]);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // تب‌های مدیریت
  const [activeTab, setActiveTab] = useState<'overview' | 'assign' | 'register_student' | 'renew_plan'>('overview');

  // فرم تخصیص مشاور (/rksp/v1/admin/assign)
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignMentorId, setAssignMentorId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMsg, setAssignMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // فرم ثبت‌نام دانش‌آموز جدید توسط مدیر (/rksp/v1/admin/register-student)
  const [newStudent, setNewStudent] = useState({
    name: '',
    mobile: '',
    grade: 'دوازدهم',
    major: 'تجربی',
    city: 'تهران',
    mentor_id: '',
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerMsg, setRegisterMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // فرم تمدید طرح (/rksp/v1/admin/plan/renew)
  const [renewForm, setRenewForm] = useState({
    student_id: '',
    plan_name: 'طرح ۱ ماهه VIP پلاس',
    price: 1800000,
    end_date: '2026-10-15',
  });
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewMsg, setRenewMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const chData = await api.student.channels();
      if (Array.isArray(chData)) {
        setChannels(chData);
      }
    } catch (e: any) {
      console.warn('Could not load channels:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleAssignMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignStudentId || !assignMentorId) {
      setAssignMsg({ text: 'لطفاً شناسه دانش‌آموز و مشاور را وارد نمایید.', type: 'error' });
      return;
    }
    try {
      setAssignLoading(true);
      setAssignMsg(null);
      const res = await api.admin.assign({
        student_id: Number(assignStudentId),
        mentor_id: Number(assignMentorId),
      });
      setAssignMsg({
        text: res?.message || 'مشاور با موفقیت به دانش‌آموز اختصاص یافت.',
        type: 'success',
      });
      setAssignStudentId('');
      setAssignMentorId('');
    } catch (e: any) {
      console.error(e);
      setAssignMsg({
        text: e?.message || 'خطا در تخصیص مشاور به دانش‌آموز.',
        type: 'error',
      });
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.mobile) {
      setRegisterMsg({ text: 'نام و شماره موبایل دانش‌آموز الزامی است.', type: 'error' });
      return;
    }
    try {
      setRegisterLoading(true);
      setRegisterMsg(null);
      const payload: any = { ...newStudent };
      if (payload.mentor_id) {
        payload.mentor_id = Number(payload.mentor_id);
      }
      const res = await api.admin.registerStudent(payload);
      setRegisterMsg({
        text: res?.message || 'دانش‌آموز با موفقیت در سامانه ثبت گردید.',
        type: 'success',
      });
      setNewStudent({
        name: '',
        mobile: '',
        grade: 'دوازدهم',
        major: 'تجربی',
        city: 'تهران',
        mentor_id: '',
      });
    } catch (e: any) {
      console.error(e);
      setRegisterMsg({
        text: e?.message || 'خطا در ثبت دانش‌آموز.',
        type: 'error',
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleRenewPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewForm.student_id || !renewForm.end_date) {
      setRenewMsg({ text: 'شناسه دانش‌آموز و تاریخ پایان جدید الزامی است.', type: 'error' });
      return;
    }
    try {
      setRenewLoading(true);
      setRenewMsg(null);
      const res = await api.admin.renewPlan({
        student_id: Number(renewForm.student_id),
        plan_name: renewForm.plan_name,
        price: Number(renewForm.price),
        end_date: renewForm.end_date,
      });
      setRenewMsg({
        text: res?.message || 'طرح با موفقیت تمدید و فعال شد.',
        type: 'success',
      });
    } catch (e: any) {
      console.error(e);
      setRenewMsg({
        text: e?.message || 'خطا در تمدید طرح.',
        type: 'error',
      });
    } finally {
      setRenewLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* هدر پیشخوان */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white text-[11px] font-mono px-2 py-0.5 rounded font-bold">
              پنل مدیریت
            </span>
            <h1 className="text-xl font-black text-slate-900">
              پیشخوان نظارتی و مدیریتی راه کنکور
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            مدیریت دانش‌آموزان، تخصیص مشاور، تمدید اشتراک‌ها و مانیتورینگ وضعیت تحصیلی
          </p>
        </div>

        <button
          type="button"
          onClick={fetchChannels}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>به‌روزرسانی</span>
        </button>
      </div>

      {/* منوی تب‌های عملیاتی مدیریت */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>پایش اشتراک‌ها و مشاوران</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assign')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'assign'
              ? 'bg-white text-orange-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>تخصیص مشاور به دانش‌آموز</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('register_student')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'register_student'
              ? 'bg-white text-emerald-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>ثبت دانش‌آموز جدید</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('renew_plan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'renew_plan'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>تمدید طرح و اشتراک</span>
        </button>
      </div>

      {fetchError && <ErrorState onRetry={fetchChannels} message={fetchError} />}

      {/* تب ۱: نمای کلی و پایش */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* کارت‌های آمار بالا */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">کل دانش‌آموزان</span>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-black text-slate-900">{stats.total_students} نفر</div>
              <div className="text-[11px] text-slate-400 mt-1">فعال در پنل و اپلیکیشن</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">طرح‌های در آستانه انقضا</span>
                <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-black text-amber-600">{stats.expiring_plans} طرح</div>
              <div className="text-[11px] text-amber-600/80 mt-1">کمتر از ۵ روز تا انقضا</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">بدون مشاور تخصیص‌یافته</span>
                <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-black text-rose-600">{stats.unassigned_count} دانش‌آموز</div>
              <div className="text-[11px] text-slate-400 mt-1">نیاز به انتساب سریع مشاور</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">مشاوران تحصیلی فعال</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-black text-emerald-600">{stats.active_mentors} مشاور</div>
              <div className="text-[11px] text-slate-400 mt-1">در حال هدایت و نظارت تحصیلی</div>
            </div>
          </div>

          {/* جدول مانیتورینگ انقضای طرح‌ها */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">وضعیت انقضای اشتراک‌های مشاوره</h3>
                <p className="text-xs text-slate-500 mt-0.5">هشدار تمدید برای پشتیبانی و جلوگیری از وقفه در مشاوره دانش‌آموزان</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="pb-3 pr-2">شناسه</th>
                    <th className="pb-3">دانش‌آموز</th>
                    <th className="pb-3">شماره تماس</th>
                    <th className="pb-3">مشاور مربوطه</th>
                    <th className="pb-3">عنوان طرح</th>
                    <th className="pb-3">تاریخ انقضا</th>
                    <th className="pb-3">روز باقیمانده</th>
                    <th className="pb-3 text-left pl-2">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plansTable.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-2 font-mono text-slate-500">#{item.student_id}</td>
                      <td className="py-3 font-bold text-slate-900">{item.student_name}</td>
                      <td className="py-3 font-mono text-slate-600" dir="ltr">{item.phone}</td>
                      <td className="py-3 text-slate-700">{item.mentor_name}</td>
                      <td className="py-3 text-slate-700">{item.plan_name}</td>
                      <td className="py-3 font-mono text-slate-600" dir="ltr">{item.end_date}</td>
                      <td className="py-3">
                        {item.is_expired ? (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-bold text-[11px]">
                            منقضی شده
                          </span>
                        ) : item.days_left <= 2 ? (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">
                            {item.days_left} روز مانده
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            {item.days_left} روز مانده
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-left pl-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRenewForm({
                              ...renewForm,
                              student_id: String(item.student_id),
                            });
                            setActiveTab('renew_plan');
                          }}
                          className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-lg transition-colors text-[11px]"
                        >
                          تمدید طرح
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* بار کاری مشاوران */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-1">توزیع ظرفیت و بار کاری مشاوران</h3>
            <p className="text-xs text-slate-500 mb-4">میزان تخصیص دانش‌آموزان به هر مشاور تحصیلی</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mentorsWorkload.map((mentor) => (
                <div key={mentor.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{mentor.name}</div>
                      <div className="text-[11px] text-slate-500">{mentor.specialty}</div>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-1 rounded-lg border border-slate-200">
                      #{mentor.id}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">دانش‌آموزان تحت پوشش:</span>
                      <span className="font-bold text-slate-800">{mentor.student_count} از {mentor.capacity}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (mentor.student_count / mentor.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* کانال‌های ارتباطی */}
          {channels.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-base font-black text-slate-900 mb-1">کانال‌های ارتباطی فعال (`rksp/v1/channels`)</h3>
              <p className="text-xs text-slate-500 mb-4">مسیرهای پشتیبانی و تماس متصل به سامانه</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {channels.map((ch) => (
                  <div key={ch.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{ch.title}</span>
                    <span className="text-xs font-mono text-slate-500" dir="ltr">{ch.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* تب ۲: تخصیص مشاور */}
      {activeTab === 'assign' && (
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-black text-slate-900">تخصیص مشاور به دانش‌آموز</h3>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            اتصال دانش‌آموز به مشاور تحصیلی از طریق اندپوینت استاندارد <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">/rksp/v1/admin/assign</code>
          </p>

          <form onSubmit={handleAssignMentor} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">شناسه (ID) دانش‌آموز</label>
              <input
                type="number"
                value={assignStudentId}
                onChange={(e) => setAssignStudentId(e.target.value)}
                placeholder="مثلاً: 114"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">شناسه (ID) مشاور تحصیلی</label>
              <input
                type="number"
                value={assignMentorId}
                onChange={(e) => setAssignMentorId(e.target.value)}
                placeholder="مثلاً: 2"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-orange-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={assignLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors text-sm flex items-center justify-center gap-2"
            >
              {assignLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>ثبت تخصیص مشاور</span>
            </button>

            {assignMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  assignMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {assignMsg.text}
              </div>
            )}
          </form>
        </div>
      )}

      {/* تب ۳: ثبت دانش‌آموز جدید توسط مدیر */}
      {activeTab === 'register_student' && (
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-slate-900">ثبت دانش‌آموز جدید در سامانه</h3>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            ایجاد حساب کاربری مستقیم از طریق اندپوینت <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">/rksp/v1/admin/register-student</code>
          </p>

          <form onSubmit={handleRegisterStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نام و نام خانوادگی دانش‌آموز</label>
              <input
                type="text"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                placeholder="مثلاً: پوریا شمس"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">شماره موبایل (جهت ورود و ارسال پیامک)</label>
              <input
                type="tel"
                value={newStudent.mobile}
                onChange={(e) => setNewStudent({ ...newStudent, mobile: e.target.value })}
                placeholder="09121234567"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono outline-none focus:border-emerald-500 text-left"
                dir="ltr"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">پایه تحصیلی</label>
                <select
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                >
                  <option value="دهم">دهم</option>
                  <option value="یازدهم">یازدهم</option>
                  <option value="دوازدهم">دوازدهم</option>
                  <option value="فارغ‌التحصیل">فارغ‌التحصیل</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رشته تحصیلی</label>
                <select
                  value={newStudent.major}
                  onChange={(e) => setNewStudent({ ...newStudent, major: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                >
                  <option value="تجربی">علوم تجربی</option>
                  <option value="ریاضی">ریاضی و فیزیک</option>
                  <option value="انسانی">علوم انسانی</option>
                  <option value="هنر">هنر / منحصراً زبان</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">شهر</label>
                <input
                  type="text"
                  value={newStudent.city}
                  onChange={(e) => setNewStudent({ ...newStudent, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">شناسه مشاور (اختیاری)</label>
                <input
                  type="number"
                  value={newStudent.mentor_id}
                  onChange={(e) => setNewStudent({ ...newStudent, mentor_id: e.target.value })}
                  placeholder="اختیاری"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={registerLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors text-sm flex items-center justify-center gap-2"
            >
              {registerLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>ثبت نام دانش‌آموز</span>
            </button>

            {registerMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  registerMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {registerMsg.text}
              </div>
            )}
          </form>
        </div>
      )}

      {/* تب ۴: تمدید طرح */}
      {activeTab === 'renew_plan' && (
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-slate-900">تمدید یا ثبت طرح مشاوره</h3>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            اعمال تاریخ انقضای جدید از طریق اندپوینت <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">/rksp/v1/admin/plan/renew</code>
          </p>

          <form onSubmit={handleRenewPlan} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">شناسه (ID) دانش‌آموز</label>
              <input
                type="number"
                value={renewForm.student_id}
                onChange={(e) => setRenewForm({ ...renewForm, student_id: e.target.value })}
                placeholder="مثلاً: 110"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان طرح</label>
                <input
                  type="text"
                  value={renewForm.plan_name}
                  onChange={(e) => setRenewForm({ ...renewForm, plan_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">تاریخ پایان جدید</label>
                <input
                  type="date"
                  value={renewForm.end_date}
                  onChange={(e) => setRenewForm({ ...renewForm, end_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={renewLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors text-sm flex items-center justify-center gap-2"
            >
              {renewLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>تمدید و فعال‌سازی فوری طرح</span>
            </button>

            {renewMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  renewMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {renewMsg.text}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
